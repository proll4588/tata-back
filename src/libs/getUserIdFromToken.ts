import jwt from 'jsonwebtoken';
import { TokenData } from '../type';
export const getUserIdFromToken = (token: string): TokenData => {
  return jwt.verify(token, 'secret') as TokenData;
};
