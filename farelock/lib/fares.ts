import { cache } from "react";
import { api } from "@/lib/api";
import type {
  FareDetail,
  FarePoint,
  FareSearchResult,
  FlightEndpoint,
} from "@/types/fare";

/*
 * Where fare data comes from: the backend's /fares endpoints.
 *
 * The backend sends the same information the frontend types describe, but in
 * Python-style names (airline_name, fare_cents). The to… functions at the
 * bottom rename them. Prices are cents on both sides.
 *
 * Both are wrapped in React's cache() so several components can ask for the
 * same thing during one page render without fetching twice.
 */

/** Fares matching a search, e.g. "atl to lax nov 20". */
export const searchFares = cache(
  async (query: string): Promise<FareSearchResult[]> => {
    if (!query.trim()) return [];
    try {
      const data = await api<{ results: BackendFare[] }>("/fares/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      return data.results.map(toFare);
    } catch (error) {
      // 422: the backend couldn't read the query. 503: flight search is down.
      console.error("Search failed:", error);
      return [];
    }
  },
);

/** One fare for the trading page, or null if the id is unknown. */
export const getFare = cache(async (id: string): Promise<FareDetail | null> => {
  let data: BackendFareDetail;
  try {
    data = await api<BackendFareDetail>(`/fares/${encodeURIComponent(id)}`);
  } catch (error) {
    // 404: the fare was never returned by a search, so the backend has no copy.
    console.error("Fare lookup failed:", error);
    return null;
  }

  const fare = toFare(data.fare);
  const history: FarePoint[] = data.history.map((point) => ({
    date: point.date,
    amount: point.amount_cents,
  }));
  return {
    ...fare,
    // The chart needs at least one point, so fall back to today's fare.
    history: history.length
      ? history
      : [{ date: new Date().toISOString().slice(0, 10), amount: fare.fare.amount }],
    // The backend doesn't have these yet.
    aircraft: "—",
    baggage: "—",
    fareRules: "—",
    weeklyMovePercent: Math.abs(fare.trend.changePercent),
  };
});

// ------------------------------------------------------- backend shapes

/** One fare as the backend sends it (FareSearchResultResponse in schemas.py). */
type BackendFare = {
  id: string;
  airline_name: string;
  flight_number: string;
  cabin_class: string;
  stop_airports: string[];
  depart: BackendEndpoint;
  arrive: BackendEndpoint;
  duration_minutes: number;
  fare_cents: number;
  lock: { fee_cents: number } | null;
  trend: { points_cents: number[]; change_percent: number };
};

type BackendEndpoint = {
  airport_code: string;
  airport_name: string;
  city: string;
  local_time: string;
};

/** GET /fares/{id} (FareDetailResponse in schemas.py). */
type BackendFareDetail = {
  fare: BackendFare;
  history: { date: string; amount_cents: number }[];
};

// ---------------------------------------------------- backend → frontend

function toFare(fare: BackendFare): FareSearchResult {
  const amount = fare.fare_cents;
  const points = fare.trend.points_cents;
  return {
    id: fare.id,
    airlineName: fare.airline_name,
    flightNumber: fare.flight_number,
    cabinClass: fare.cabin_class,
    stopAirports: fare.stop_airports,
    depart: toEndpoint(fare.depart),
    arrive: toEndpoint(fare.arrive),
    durationMinutes: fare.duration_minutes,
    fare: { amount, currency: "USD" },
    lock: fare.lock ? { fee: { amount: fare.lock.fee_cents, currency: "USD" } } : null,
    trend: {
      // A line needs two points. New fares have little history, so draw it flat.
      points: points.length >= 2 ? points : [amount, amount],
      changePercent: fare.trend.change_percent,
    },
  };
}

function toEndpoint(endpoint: BackendEndpoint): FlightEndpoint {
  return {
    airportCode: endpoint.airport_code,
    airportName: endpoint.airport_name,
    city: endpoint.city,
    localTime: endpoint.local_time,
  };
}
