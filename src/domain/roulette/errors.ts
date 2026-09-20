export class NoEligibleRestaurantsError extends Error {
  public readonly reason: string;

  constructor(message: string, reason = "FILTERS_TOO_RESTRICTIVE") {
    super(message);
    this.name = "NoEligibleRestaurantsError";
    this.reason = reason;
  }
}
