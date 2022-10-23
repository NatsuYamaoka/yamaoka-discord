export default class Pagination<T> {
  public page: number;
  public elementsOnPage: number;
  public elements: T[];
  public totalPages: number;

  constructor(elements: T[], options?: PaginationSettings) {
    this.page = options?.page ?? 1;
    this.elementsOnPage = options?.elementsOnPage ?? 10;
    this.elements = elements;
    this.totalPages = Math.ceil(elements.length / this.elementsOnPage);
  }

  public setPage(mode: PaginationMode) {
    switch (mode) {
      case "plus":
        if (this.page + 1 > this.totalPages) {
          this.page = this.totalPages;
        } else {
          this.page++;
        }
        break;
      case "minus":
        if (this.page - 1 === 0) {
          this.page = 1;
        } else {
          this.page--;
        }
        break;
    }

    return this;
  }

  public createPage() {
    return this.elements.slice(
      (this.page - 1) * this.elementsOnPage,
      this.page * this.elementsOnPage
    );
  }
}

type PaginationMode = "plus" | "minus";
interface PaginationSettings {
  page?: number;
  elementsOnPage?: number;
}
