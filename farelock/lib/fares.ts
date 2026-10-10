import { cache } from "react";
import type { FareSearchResult } from "@/types/fare";

/**
 * Find fares for a search.
 *
 * PLACEHOLDER: there is no backend yet, so every non-empty query returns the
 * same mock fares below. Replace the body with the real request; the pages
 * and components only depend on the FareSearchResult shape.
 *
 * Wrapped in React's cache() so the results heading and the results list can
 * both ask for the same search during one page render without fetching twice.
 */
export const searchFares = cache(
  async (query: string): Promise<FareSearchResult[]> => {
    if (!query.trim()) return [];
    return MOCK_FARES;
  },
);

/** A repeatable 30-day fare history, so mock charts look the same each load. */
function mockTrend(seed: number, startCents: number, driftPerDay: number) {
  const points: number[] = [];
  for (let day = 0; day < 30; day++) {
    const wobble =
      Math.sin(day * 0.9 + seed) * 1400 + Math.sin(day * 0.37 + seed * 2) * 2200;
    points.push(Math.round(startCents + driftPerDay * day + wobble));
  }
  return points;
}

const MOCK_FARES: FareSearchResult[] = [
  {
    id: "jfk-lis-2027-01-12-ma202",
    airlineName: "Mock Atlantic",
    flightNumber: "MA 202",
    cabinClass: "Economy",
    stopAirports: [],
    depart: { airportCode: "JFK", city: "New York", localTime: "2027-01-12T18:30" },
    arrive: { airportCode: "LIS", city: "Lisbon", localTime: "2027-01-13T06:25" },
    durationMinutes: 415,
    fare: { amount: 58700, currency: "USD" },
    lock: { fee: { amount: 2200, currency: "USD" }, lengthDays: 7 },
    trend: { points: mockTrend(1, 52000, 230), changePercent: 3.1 },
  },
  {
    id: "jfk-lis-2027-01-12-ma118",
    airlineName: "Mock Atlantic",
    flightNumber: "MA 118",
    cabinClass: "Economy",
    stopAirports: [],
    depart: { airportCode: "JFK", city: "New York", localTime: "2027-01-12T07:40" },
    arrive: { airportCode: "LIS", city: "Lisbon", localTime: "2027-01-12T19:55" },
    durationMinutes: 435,
    fare: { amount: 61200, currency: "USD" },
    lock: { fee: { amount: 2400, currency: "USD" }, lengthDays: 7 },
    trend: { points: mockTrend(2, 57000, 150), changePercent: 1.4 },
  },
  {
    id: "jfk-lis-2027-01-12-sa6252",
    airlineName: "Sample Air",
    flightNumber: "SA 6252",
    cabinClass: "Economy",
    stopAirports: ["MAD"],
    depart: { airportCode: "JFK", city: "New York", localTime: "2027-01-12T21:15" },
    arrive: { airportCode: "LIS", city: "Lisbon", localTime: "2027-01-13T12:40" },
    durationMinutes: 625,
    fare: { amount: 54000, currency: "USD" },
    lock: { fee: { amount: 1900, currency: "USD" }, lengthDays: 7 },
    trend: { points: mockTrend(3, 59000, -170), changePercent: -2.6 },
  },
  {
    id: "jfk-lis-2027-01-12-ea178",
    airlineName: "Example Airways",
    flightNumber: "EA 178",
    cabinClass: "Premium economy",
    stopAirports: ["LHR"],
    depart: { airportCode: "JFK", city: "New York", localTime: "2027-01-12T16:05" },
    arrive: { airportCode: "LIS", city: "Lisbon", localTime: "2027-01-13T08:50" },
    durationMinutes: 705,
    fare: { amount: 65500, currency: "USD" },
    lock: null,
    trend: { points: mockTrend(4, 64500, 30), changePercent: 0 },
  },
];
