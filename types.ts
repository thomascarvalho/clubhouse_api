export type Method = "GET" | "POST" | "PUT" | "DELETE";

export type Token = string | undefined;

export type GetParams = Record<string, unknown>;
export type BodyParams = Record<string, unknown>;

export type Config = {
  baseUrl?: string;
  token?: Token;
};

export type ApiOptions = {
  method?: Method;
  body?: BodyParams;
  params?: GetParams;
  headers?: {
    "Content-Type": ContentType.JSON;
    "Clubhouse-Token": string;
  };
};

export enum ContentType {
  JSON = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}
