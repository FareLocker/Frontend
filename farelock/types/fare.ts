/**
 * The shape of one search result.
 *
 * PROPOSED: the backend does not exist yet, so this is the contract the
 * frontend is built against. Change it here first and TypeScript will point
 * at every component that needs to follow.
 */

/** Money is whole minor units (cents) plus a currency, never a float. */
export type Money = {
  amount: number;
  /** ISO 4217, e.g. "USD". */
  currency: string;
};

export type FlightEndpoint = {
  /** IATA code, e.g. "JFK". */
  airportCode: string;
  city: string;
  /**
   * Wall-clock time at that airport, "YYYY-MM-DDTHH:mm", with no offset.
   * It is shown exactly as written. Do not turn it into a Date in the
   * viewer's time zone: 07:40 in New York must read 07:40 everywhere.
   */
  localTime: string;
};

export type FareLockQuote = {
  fee: Money;
  lengthDays: number;
};

export type FareTrend = {
  /** Daily fares in minor units, oldest first. Drawn as the trend chart. */
  points: number[];
  /** Change over the last 7 days, e.g. 4.2 for +4.2%. */
  changePercent: number;
};

export type FareSearchResult = {
  /**
   * Identifies the itinerary (route, date, flight), and is what /fares/[id]
   * is keyed on. It must not be a Duffel offer id: those expire in minutes.
   */
  id: string;
  airlineName: string;
  flightNumber: string;
  cabinClass: string;
  /** Airports stopped at on the way, in order. Empty means nonstop. */
  stopAirports: string[];
  depart: FlightEndpoint;
  arrive: FlightEndpoint;
  durationMinutes: number;
  fare: Money;
  /** null when a lock cannot be sold on this fare. */
  lock: FareLockQuote | null;
  trend: FareTrend;
};
