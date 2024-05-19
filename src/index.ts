import express from 'express';
import { router as authRouter } from './routes/auth.route';
import { router as requestRouter } from './routes/request.router';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/request', requestRouter);

app.listen(3210, () => {
  console.log('app started');
});
