/**
 * The shape of fare data.
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
  /** Full airport name, e.g. "John F. Kennedy International". */
  airportName: string;
  city: string;
  /**
   * Wall-clock time at that airport, "YYYY-MM-DDTHH:mm", with no offset.
   * It is shown exactly as written. Do not turn it into a Date in the
   * viewer's time zone: 07:40 in New York must read 07:40 everywhere.
   */
  localTime: string;
};

/**
 * The price of locking a fare. A lock has no length to choose: it runs from
 * purchase until the flight departs.
 */
export type FareLockQuote = {
  fee: Money;
};

export type FareTrend = {
  /** Daily fares in minor units, oldest first. Drawn as the trend chart. */
  points: number[];
  /** Change over the last 7 days, e.g. 4.2 for +4.2%. */
  changePercent: number;
};

/** One search result: enough to draw a FareSearchCard. */
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

/** The fare on one day. */
export type FarePoint = {
  /** The day the fare was seen, "YYYY-MM-DD". */
  date: string;
  /** Minor units, in the same currency as the fare. */
  amount: number;
};

/** Everything the trading page (/fares/[id]) shows about one fare. */
export type FareDetail = FareSearchResult & {
  /**
   * Every fare we have on record for this itinerary, oldest first: one point
   * a day, for as far back as we have been tracking it. That can be months or
   * a few days, so nothing may assume a length.
   *
   * The chart draws all of it, and the lowest and highest fares are worked
   * out from it, so they can never disagree with the chart.
   */
  history: FarePoint[];
  aircraft: string;
  baggage: string;
  fareRules: string;
  /** How much this fare typically moves in a week, e.g. 4.2 for ±4.2%. */
  weeklyMovePercent: number;
};
