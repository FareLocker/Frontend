import { cache } from "react";
import { api } from "@/lib/api";
import type {
  FareDetail,
  FarePoint,
  FareSearchResult,
  FareTrend,
  FlightEndpoint,
} from "@/types/fare";

/*
 * Where fare data comes from: the backend's /fares endpoints.
 *
 * The backend sends the same information the frontend types describe, but in
 * Python-style names (airline_name, fare_cents). The to… functions at the
 * bottom rename them. Prices are cents on both sides.
 *
 * Price charts come from two sources:
 * - Search cards: each flight's own tracked prices (fare_observations, sent
 *   as trend.points_cents). A fare with fewer than two draws a flat line.
 * - The fare page: GET /fares/price-history, Google Flights' daily lowest
 *   fare for the flight's route and date (Google keeps no history for one
 *   exact flight). Falls back to the tracked prices if Google has none.
 *
 * Everything is wrapped in React's cache() so several components can ask for
 * the same thing during one page render without fetching twice.
 */

/** Fares matching a search, e.g. "atl to lax nov 20". */
export const searchFares = cache(
  async (query: string): Promise<FareSearchResult[]> => {
    if (!query.trim()) return [];

    let results: BackendFare[];
    try {
      const data = await api<{ results: BackendFare[] }>("/fares/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      // Nonstop only for now: those are the flights the scraper tracks and
      // the lock is priced on.
      results = data.results.filter((result) => result.stop_airports.length === 0);
    } catch (error) {
      // 422: the backend couldn't read the query. 503: flight search is down.
      console.error("Search failed:", error);
      return [];
    }
    // Each card's line is that flight's own tracked prices, straight from
    // the backend (toFare draws a flat line when there are fewer than two).
    return results.map(toFare);
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
  const tracked: FarePoint[] = data.history.map((point) => ({
    date: point.date,
    amount: point.amount_cents,
  }));

  // Google's history for this flight's route and date comes first; our own
  // tracked prices are the fallback when Google has none.
  const google = await routeHistoryFor(fare);

  const history =
    google.length >= 2
      ? google
      : tracked.length
        ? tracked
        : // The chart needs at least one point, so fall back to today's fare.
          [{ date: new Date().toISOString().slice(0, 10), amount: fare.fare.amount }];
  const trend = history.length >= 2 ? trendFrom(history) : fare.trend;

  return {
    ...fare,
    trend,
    history,
    // The backend doesn't have these yet.
    aircraft: "—",
    baggage: "—",
    fareRules: "—",
    weeklyMovePercent: typicalWeeklyMove(history),
  };
});

// ------------------------------------------------------------ price history

/**
 * Google's daily lowest fare for a route and date, oldest first, or [] if
 * there is none or the call fails (the endpoint answers 502 when Google
 * doesn't). Takes plain strings so cache() can match repeat calls.
 */
const getRouteHistory = cache(
  async (
    origin: string,
    destination: string,
    departureDate: string,
    flightNumber: string,
  ): Promise<FarePoint[]> => {
    const query = new URLSearchParams({
      origin,
      destination,
      departure_date: departureDate,
      flight_number: flightNumber,
    });
    try {
      const data = await api<BackendPriceHistory>(`/fares/price-history?${query}`);
      return data.price_history.map((point) => ({
        date: point.date,
        amount: point.amount_cents,
      }));
    } catch (error) {
      console.error("Price history failed:", error);
      return [];
    }
  },
);

/** The route history for a fare's route and departure date. */
function routeHistoryFor(fare: FareSearchResult): Promise<FarePoint[]> {
  return getRouteHistory(
    fare.depart.airportCode,
    fare.arrive.airportCode,
    fare.depart.localTime.slice(0, 10), // "2026-11-20T09:50" → "2026-11-20"
    fare.flightNumber,
  );
}

/** How many days a search card's small chart shows. */
const CARD_TREND_DAYS = 30;

/** The card's line (last 30 days) and its change over the last 7 days. */
function trendFrom(history: FarePoint[]): FareTrend {
  const amounts = history.map((point) => point.amount);
  const now = amounts[amounts.length - 1];
  const weekAgo = amounts[Math.max(0, amounts.length - 8)];
  return {
    points: amounts.slice(-CARD_TREND_DAYS),
    changePercent: weekAgo ? round1(((now - weekAgo) / weekAgo) * 100) : 0,
  };
}

/** Average size of the 7-day moves across the history, in percent. */
function typicalWeeklyMove(history: FarePoint[]): number {
  const amounts = history.map((point) => point.amount);
  const moves: number[] = [];
  for (let i = 7; i < amounts.length; i++) {
    if (amounts[i - 7]) {
      moves.push(Math.abs(amounts[i] - amounts[i - 7]) / amounts[i - 7]);
    }
  }
  if (!moves.length) return 0;
  return round1((moves.reduce((sum, move) => sum + move, 0) / moves.length) * 100);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

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

/** GET /fares/price-history (GooglePriceHistoryResponse in schemas.py). */
type BackendPriceHistory = {
  price_level: "low" | "typical" | "high" | "";
  /** Dollars, not cents. */
  typical_price_range: [number, number] | null;
  price_history: { date: string; amount_cents: number }[];
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
