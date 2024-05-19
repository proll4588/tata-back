import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../controller/prisma.controller';
import { createToken } from '../libs/createToken';
import { MyRequest } from '../type';

export const router = Router();

interface RegisterEndpoint {
  email: string;
  password: string;
}
/** @testes */ 
router.post('/register', async (req: MyRequest<RegisterEndpoint>, res) => {
  const { email, password } = req.body;

  const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  const candidate = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  if (!!candidate) {
    res.status(400).json({ error: 'Такой пользователь уже существует' });
  }

  const newUser = await prisma.users.create({
    data: {
      email,
      password: hashPass,
    },
  });

  const userToken = createToken(String(newUser.id));

  res.status(200).json({ token: userToken });
});

interface LoginEndpoint {
  email: string;
  password: string;
}
/** @testes */ 
router.post('/login', async (req: MyRequest<LoginEndpoint>, res) => {
  const { email, password } = req.body;

  const candidate = await prisma.users.findUnique({ where: { email } });

  if (!candidate) {
    res.status(401).json({ error: 'Не верно введён логин или пароль' });
    return;
  }

  if (!bcrypt.compareSync(password, candidate.password)) {
    res.status(401).json({ error: 'Не верно введён логин или пароль' });
    return;
  }

  const userToken = createToken(String(candidate.id));

  res.status(200).json({ token: userToken });
});

/** @testes */ 
router.post('/loginAdmin', async (req: MyRequest<LoginEndpoint>, res) => {
  const { email, password } = req.body;

  const candidate = await prisma.users.findUnique({ where: { email } });

  if (!candidate) {
    res.status(401).json({ error: 'Не верно введён логин или пароль' });
    return;
  }

  if (!bcrypt.compareSync(password, candidate.password)) {
    res.status(401).json({ error: 'Не верно введён логин или пароль' });
    return;
  }

  if (candidate.id === 5 || candidate.id === 6) {
    const userToken = createToken(String(candidate.id));
    res.status(200).json({ token: userToken });
    return;
  }

  res.status(401).json({ error: 'Не верно введён логин или пароль' });
});
