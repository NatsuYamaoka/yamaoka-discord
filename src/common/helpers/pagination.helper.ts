type PaginationHelperOptions = {
  page?: number;
  elementsOnPage?: number;
};

export default class PaginationHelper<T> {
  public page: number;
  public elementsOnPage: number;
  public elements: T[];
  public totalPages: number;

  constructor(
    elements: T[],
    { elementsOnPage = 10, page = 1 }: PaginationHelperOptions
  ) {
    this.page = page;
    this.elementsOnPage = elementsOnPage;
    this.elements = elements;

    this.totalPages = Math.ceil(this.elements.length / this.elementsOnPage);
  }

  public nextPage() {
    this.page =
      this.page + 1 > this.totalPages ? this.totalPages : this.page + 1;

    return this;
  }

  public prevPage() {
    this.page = this.page - 1 <= 0 ? 1 : this.page - 1;

    return this;
  }

  public createPage() {
    const start = this.page - 1 * this.elementsOnPage;
    const end = this.page * this.elementsOnPage;

    return this.elements.slice(start, end);
  }
}
