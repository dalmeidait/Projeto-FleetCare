import express from 'express';
import cors from 'cors';
import { router } from './routes';

const app = express();

app.use(express.json());
app.use(cors());

app.use(router);

const PORT = 3333;

app.listen(3333, '0.0.0.0', () => {
  console.log('🚀 Server running on port 3333 e visível na rede!');
});