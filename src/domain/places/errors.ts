export class InvalidCoordinatesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCoordinatesError";
  }
}

export class PlacesProviderError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "PlacesProviderError";
    this.statusCode = statusCode;
  }
}
