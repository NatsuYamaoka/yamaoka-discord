import { Axios, AxiosRequestConfig } from "axios";
import { BaseApiOptions } from "./base-api.types";

export class BaseApi {
  constructor(private axios: Axios, private config: AxiosRequestConfig) {}

  public get<Q, B extends {} = {}>(
    endpoint: string,
    options?: BaseApiOptions<B>
  ) {
    const formedUrl = this.createUrl(endpoint);
    const formedUrlWithAttachedParams = this.attachParams(
      formedUrl,
      options?.body
    );
    const formedConfig = this.formConfig(options?.config);

    return this.axios.get<Q>(formedUrlWithAttachedParams, formedConfig);
  }

  public post<Q, B extends {} = {}>(
    endpoint: string,
    options?: BaseApiOptions<B>
  ) {
    const formedUrl = this.createUrl(endpoint);
    const formedConfig = this.formConfig(options?.config);

    return this.axios.post<Q>(formedUrl, options?.body, formedConfig);
  }

  public put<Q, B extends {} = {}>(
    endpoint: string,
    options?: BaseApiOptions<B>
  ) {
    const formedUrl = this.createUrl(endpoint);
    const formedConfig = this.formConfig(options?.config);

    return this.axios.put<Q>(formedUrl, options?.body, formedConfig);
  }

  public patch<Q, B extends {} = {}>(
    endpoint: string,
    options?: BaseApiOptions<B>
  ) {
    const formedUrl = this.createUrl(endpoint);
    const formedConfig = this.formConfig(options?.config);

    return this.axios.patch<Q>(formedUrl, options?.body, formedConfig);
  }

  public delete<Q, B extends {} = {}>(
    endpoint: string,
    options?: BaseApiOptions<B>
  ) {
    const formedUrl = this.createUrl(endpoint);
    const formedConfig = this.formConfig(options?.config);

    return this.axios.delete<Q>(formedUrl, formedConfig);
  }

  public attachAuthorizationHeader(tokenType: string, token: string) {
    this.config.headers = {
      ...this.config.headers,
      ...this.formAuthorizationHeader(tokenType, token),
    };
  }

  private createUrl(endpoint: string): string {
    return `${this.config.baseURL}/${endpoint}`;
  }

  private formAuthorizationHeader(tokenType: string, token: string) {
    return { authorization: `${tokenType} ${token}` };
  }

  private formConfig(config: AxiosRequestConfig = {}) {
    return { ...this.config, ...(config ?? {}) };
  }

  private attachParams(
    url: string,
    params: Record<string, string> | undefined
  ): string {
    const formedSearchParams = new URLSearchParams(params ?? {});
    const formedQuery = formedSearchParams.toString()
      ? `?${formedSearchParams.toString()}`
      : "";

    return `${url}${formedQuery}`;
  }
}
