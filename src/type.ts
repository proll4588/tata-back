import { Request } from 'express';
export type MyRequest<T> = Request<any, any, T>;

export type MyResponse<T> = Request<any, any, T | ResponseError>;

export interface ResponseError {
  error: string;
}

export interface TokenData {
  userId: string;
}
