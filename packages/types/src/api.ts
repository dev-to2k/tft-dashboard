export interface ApiResponse<T> {
  data: T;
  patch: string;
  eloBracket: string;
  computedAt: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
