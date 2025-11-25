import { prisma } from "./prisma.js";

interface PaginationOptions<T, V> {
  page?: number;
  limit?: number;
  where?: T;
  orderBy?: V;
}

export async function paginate<T, V>(
  prismaModel: any,
  options: PaginationOptions<T, V>
) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prismaModel.findMany({
      select: {
        id: true,
        name: true,
        author: true,
        photo: true,
      },
      where: options.where,
      orderBy: options.orderBy,
      skip,
      take: limit,
    }),
    prismaModel.count({ where: options.where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}
