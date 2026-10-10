import { cache } from "react";
import { ApiError, api } from "@/lib/api";
import type { FareDetail, FarePoint, FareSearchResult } from "@/types/fare";

type FareSearchApiResponse = {
  results: Array<{
    id: string;
    airline_name: string;
    flight_number: string;
    cabin_class: string;
    stop_airports: string[];
    depart: { airport_code: string; airport_name: string; city: string; local_time: string };
    arrive: { airport_code: string; airport_name: string; city: string; local_time: string };
    duration_minutes: number;
    fare_cents: number;
    lock: { fee_cents: number } | null;
    trend: { points_cents: number[]; change_percent: number };
  }>;
};

type FareDetailApiResponse = {
  fare: FareSearchApiResponse["results"][number];
  history: Array<{ date: string; amount_cents: number }>;
};

type ApiErrorDetail = {
  code?: string;
  message?: string;
};

export type FareSearchOutcome = {
  fares: FareSearchResult[];
  error: string | null;
};

function toFareSearchResult(fare: FareSearchApiResponse["results"][number]): FareSearchResult {
  return {
    id: fare.id,
    airlineName: fare.airline_name,
    flightNumber: fare.flight_number,
    cabinClass: fare.cabin_class,
    stopAirports: fare.stop_airports,
    depart: {
      airportCode: fare.depart.airport_code,
      airportName: fare.depart.airport_name,
      city: fare.depart.city,
      localTime: fare.depart.local_time,
    },
    arrive: {
      airportCode: fare.arrive.airport_code,
      airportName: fare.arrive.airport_name,
      city: fare.arrive.city,
      localTime: fare.arrive.local_time,
    },
    durationMinutes: fare.duration_minutes,
    fare: { amount: fare.fare_cents, currency: "USD" },
    lock: fare.lock ? { fee: { amount: fare.lock.fee_cents, currency: "USD" } } : null,
    trend: { points: fare.trend.points_cents, changePercent: fare.trend.change_percent },
  };
}

function naturalSearchErrorMessage(error: ApiError): string {
  if (error.status === 422) {
    const detail = error.detail as ApiErrorDetail;
    return detail.message ?? "Please include a route and date, like “ATL to LAX tomorrow”.";
  }

  return "Search is temporarily unavailable. Please try again in a moment.";
}

/** Fares matching a natural-language search query. */
export const searchFares = cache(async (query: string): Promise<FareSearchOutcome> => {
  if (!query.trim()) return { fares: [], error: null };

  try {
    const data = await api<FareSearchApiResponse>("/fares/search", {
      method: "POST",
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    return { fares: data.results.map(toFareSearchResult), error: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { fares: [], error: naturalSearchErrorMessage(error) };
    }

    return {
      fares: [],
      error: "Search is temporarily unavailable. Please try again in a moment.",
    };
  }
});

/** One fare for the trading page, or null if its search snapshot has expired. */
export const getFare = cache(async (id: string): Promise<FareDetail | null> => {
  try {
    const data = await api<FareDetailApiResponse>(`/fares/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const fare = toFareSearchResult(data.fare);
    const history: FarePoint[] = data.history.map((point) => ({
      date: point.date,
      amount: point.amount_cents,
    }));
    return {
      ...fare,
      history,
      aircraft: "Aircraft details unavailable",
      baggage: "Baggage details unavailable",
      fareRules: "Fare rules unavailable",
      weeklyMovePercent: Math.abs(fare.trend.changePercent),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
