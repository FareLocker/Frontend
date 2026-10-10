import { cache } from "react";
import type { FareDetail, FarePoint, FareSearchResult } from "@/types/fare";

/*
 * Where fare data comes from.
 *
 * PLACEHOLDER: there is no backend yet, so both functions answer from the
 * mock fares at the bottom of this file. Replace the two function bodies with
 * real requests; pages and components only depend on the types.
 *
 * Both are wrapped in React's cache() so several components can ask for the
 * same thing during one page render without fetching twice.
 */

/** Fares matching a search. Every non-empty query returns the same mocks. */
export const searchFares = cache(
  async (query: string): Promise<FareSearchResult[]> => {
    if (!query.trim()) return [];
    return MOCK_FARES;
  },
);

/** One fare for the trading page, or null if the id is unknown. */
export const getFare = cache(async (id: string): Promise<FareDetail | null> => {
  return MOCK_FARES.find((fare) => fare.id === id) ?? null;
});

// ------------------------------------------------------------------ mocks

/** The last day of every mock history. Fixed, so mocks never change. */
const MOCK_LAST_DAY = Date.UTC(2026, 9, 9);

/** A repeatable daily fare history, so mock charts look the same each load. */
function mockHistory(
  seed: number,
  startCents: number,
  driftPerDay: number,
  days = 90,
): FarePoint[] {
  const points: FarePoint[] = [];
  for (let day = 0; day < days; day++) {
    const wobble =
      Math.sin(day * 0.9 + seed) * 1400 +
      Math.sin(day * 0.37 + seed * 2) * 2200 +
      Math.sin(day * 0.11 + seed * 3) * 2600;
    const date = new Date(MOCK_LAST_DAY - (days - 1 - day) * 86_400_000);
    points.push({
      date: date.toISOString().slice(0, 10),
      amount: Math.round(startCents + driftPerDay * day + wobble),
    });
  }
  return points;
}

/** Fill in the parts of a mock that follow from its history. */
function mockFare(
  fare: Omit<FareDetail, "trend" | "fare"> & { changePercent: number },
): FareDetail {
  const { changePercent, ...rest } = fare;
  const amounts = fare.history.map((point) => point.amount);
  return {
    ...rest,
    // Today's fare is the last point of the history, rounded to a dollar.
    fare: {
      amount: Math.round(amounts[amounts.length - 1] / 100) * 100,
      currency: "USD",
    },
    trend: { points: amounts.slice(-30), changePercent },
  };
}

const JFK = {
  airportCode: "JFK",
  airportName: "John F. Kennedy International",
  city: "New York",
};
const LIS = {
  airportCode: "LIS",
  airportName: "Humberto Delgado Airport",
  city: "Lisbon",
};

const MOCK_FARES: FareDetail[] = [
  mockFare({
    id: "jfk-lis-2027-01-12-ma202",
    airlineName: "Mock Atlantic",
    flightNumber: "MA 202",
    cabinClass: "Economy",
    stopAirports: [],
    depart: { ...JFK, localTime: "2027-01-12T18:30" },
    arrive: { ...LIS, localTime: "2027-01-13T06:25" },
    durationMinutes: 415,
    lock: { fee: { amount: 2200, currency: "USD" } },
    history: mockHistory(1, 47000, 130),
    changePercent: 3.1,
    aircraft: "Sample A330-900",
    baggage: "1 carry-on, 1 checked bag",
    fareRules: "Changes for a fee, non-refundable",
    weeklyMovePercent: 4.2,
  }),
  mockFare({
    id: "jfk-lis-2027-01-12-ma118",
    airlineName: "Mock Atlantic",
    flightNumber: "MA 118",
    cabinClass: "Economy",
    stopAirports: [],
    depart: { ...JFK, localTime: "2027-01-12T07:40" },
    arrive: { ...LIS, localTime: "2027-01-12T19:55" },
    durationMinutes: 435,
    lock: { fee: { amount: 2400, currency: "USD" } },
    history: mockHistory(2, 52000, 105),
    changePercent: 1.4,
    aircraft: "Sample A321neo",
    baggage: "1 carry-on",
    fareRules: "Changes for a fee, non-refundable",
    weeklyMovePercent: 3.1,
  }),
  mockFare({
    id: "jfk-lis-2027-01-12-sa6252",
    airlineName: "Sample Air",
    flightNumber: "SA 6252",
    cabinClass: "Economy",
    stopAirports: ["MAD"],
    depart: { ...JFK, localTime: "2027-01-12T21:15" },
    arrive: { ...LIS, localTime: "2027-01-13T12:40" },
    durationMinutes: 625,
    lock: { fee: { amount: 1900, currency: "USD" } },
    history: mockHistory(3, 63000, -95),
    changePercent: -2.6,
    aircraft: "Sample 787-9",
    baggage: "1 carry-on, 1 checked bag",
    fareRules: "Free changes, non-refundable",
    weeklyMovePercent: 5.6,
  }),
  mockFare({
    id: "jfk-lis-2027-01-12-ea178",
    airlineName: "Example Airways",
    flightNumber: "EA 178",
    cabinClass: "Premium economy",
    stopAirports: ["LHR"],
    depart: { ...JFK, localTime: "2027-01-12T16:05" },
    arrive: { ...LIS, localTime: "2027-01-13T08:50" },
    durationMinutes: 705,
    lock: null,
    // Tracked for under two weeks: shows the page with a short history.
    history: mockHistory(4, 64000, 18, 12),
    changePercent: 0,
    aircraft: "Sample 777-200",
    baggage: "2 carry-on, 2 checked bags",
    fareRules: "Free changes, refundable for a fee",
    weeklyMovePercent: 1.8,
  }),
];
