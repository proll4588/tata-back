import { Router } from 'express';
import { MyRequest, ResponseError } from '../type';
import prisma from '../controller/prisma.controller';
import { Prisma } from '@prisma/client';
import { getUserIdFromToken } from '../libs/getUserIdFromToken';

export const router = Router();

interface GetRequestOptionsResponse {
  categories: Prisma.$photo_categorysPayload['scalars'][];
  types: Prisma.$photo_typesPayload['scalars'][];
}
/** @testes */
router.get('/getRequestOptions', async (_, res) => {
  const types = await prisma.photo_types.findMany();
  const categories = await prisma.photo_categorys.findMany();

  if (!types || !categories) {
    res.status(400).json({ error: 'Что-то пошло не так' } as ResponseError);
    return;
  }

  res.status(200).json({
    categories,
    types,
  } as GetRequestOptionsResponse);
});

interface GetAllRequestsResponse {
  requests: Prisma.$requestsPayload['scalars'][];
}
/** @testes */
router.post('/getAllRequests', async (_, res) => {
  const data = await prisma.requests.findMany({
    include: {
      statuses: true,
      photo_categorys: true,
      photo_types: true,
      photo_urls: true,
      users: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!data) {
    res.status(400).json({ error: 'Что-то пошло не так' } as ResponseError);
    return;
  }

  res.status(200).json({
    requests: data,
  } as GetAllRequestsResponse);
});

interface GetUserRequestsEndpoint {
  token: string;
}

type req = {
  statuses: {
    id: number;
    title: string;
    description: string | null;
  };
  photo_categorys: {
    id: number;
    title: string;
  };
  photo_types: {
    id: number;
    title: string;
  };
  photo_urls: {
    id: number;
    url: string;
    endDate: Date | null;
  } | null;
  users: {
    id: number;
    email: string;
  } | null;
} & Omit<Prisma.$requestsPayload['scalars'], 'status_id'>;
interface GetUserRequestsResponse {
  requests: req[];
}
/** @testes */
router.post(
  '/getUserRequests',
  async (req: MyRequest<GetUserRequestsEndpoint>, res) => {
    let userId;
    try {
      userId = getUserIdFromToken(req.body.token).userId;
    } catch (error) {
      res.status(400).json({ error: 'Что-то пошло не так' } as ResponseError);
      return;
    }

    const data = await prisma.requests.findMany({
      where: {
        user_id: Number(userId),
      },
      include: {
        statuses: true,
        photo_categorys: true,
        photo_types: true,
        photo_urls: true,
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!data) {
      res.status(400).json({ error: 'Что-то пошло не так' } as ResponseError);
      return;
    }

    res.status(200).json({
      requests: data,
    } as GetUserRequestsResponse);
  }
);

interface DeleteRequestEndpoint {
  requestId: number;
}
/** @testes */
router.delete(
  '/deleteRequest',
  async (req: MyRequest<DeleteRequestEndpoint>, res) => {
    await prisma.requests.delete({
      where: {
        id: req.body.requestId,
      },
    });

    res.status(200).json({});
  }
);

interface UpdateRequestEndpoint {
  requestId: number;
  request: Partial<Prisma.$requestsPayload['scalars']>;
}
/** @testes */
type UpdateRequestResponse = Partial<Prisma.$requestsPayload['scalars']>;
router.patch(
  '/updateRequest',
  async (req: MyRequest<UpdateRequestEndpoint>, res) => {
    const newData = await prisma.requests.update({
      where: {
        id: req.body.requestId,
      },
      data: req.body.request,
    });

    res.status(200).json(newData as UpdateRequestResponse);
  }
);

interface CreateRequestEndpoint {
  token?: string;
  data: Omit<
    Prisma.$requestsPayload['scalars'],
    'id' | 'user_id' | 'photo_url_id' | 'price' | 'status_id'
  >;
}
/** @testes */
router.post(
  '/createRequest',
  async (req: MyRequest<CreateRequestEndpoint>, res) => {
    let userId = undefined;
    if (req.body.token) {
      userId = Number(getUserIdFromToken(req.body.token).userId);
    }

    const newData = await prisma.requests.create({
      data: { ...req.body.data, user_id: userId },
    });

    res.status(200).json(newData as UpdateRequestResponse);
  }
);

router.post(
  '/cancelRequest',
  async (req: MyRequest<{ requestId: number }>, res) => {
    const newData = await prisma.requests.update({
      where: {
        id: req.body.requestId,
      },
      data: {
        status_id: 4,
      },
    });

    res.status(200).json(newData as UpdateRequestResponse);
  }
);
