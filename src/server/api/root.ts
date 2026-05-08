import { postRouter } from "~/server/api/routers/post";
import { weatherRouter } from "~/server/api/routers/weather";
import { cabinsRouter } from "~/server/api/routers/cabins";
import { groupsRouter } from "~/server/api/routers/groups";
import { routesRouter } from "~/server/api/routers/routes";
import { tripsRouter } from "~/server/api/routers/trips";
import { expensesRouter } from "~/server/api/routers/expenses";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  weather: weatherRouter,
  cabins: cabinsRouter,
  groups: groupsRouter,
  routes: routesRouter,
  trips: tripsRouter,
  expenses: expensesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
