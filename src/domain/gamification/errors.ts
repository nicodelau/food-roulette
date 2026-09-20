export class DuplicateVisitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateVisitError";
  }
}
