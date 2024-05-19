import jwt from 'jsonwebtoken';
import { TokenData } from '../type';

export const createToken = (userId: string) => {
  const token = jwt.sign({ userId } as TokenData, 'secret', { expiresIn: '24h' });

  return token;
};
