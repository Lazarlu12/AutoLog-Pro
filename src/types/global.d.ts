import { PrismaClient } from "@prisma/client/default";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export {};