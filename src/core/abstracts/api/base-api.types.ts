import { AxiosRequestConfig } from "axios";

export interface BaseApiOptions<B extends {}> {
  body?: B;
  config?: AxiosRequestConfig;
}
