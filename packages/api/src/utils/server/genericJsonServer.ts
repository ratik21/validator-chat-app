import {mapValues} from "@lodestar/utils";
// eslint-disable-next-line import/no-extraneous-dependencies
import {ReqGeneric, RouteGeneric, ReturnTypes, TypeJson, Resolves, RouteGroupDefinition} from "../types.js";
import {getFastifySchema} from "../schema.js";
import {toColonNotationPath} from "../urlFormat.js";
import {ServerRoute} from "./types.js";

// See /packages/api/src/routes/index.ts for reasoning

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention */

export type ServerRoutes<Api extends Record<string, RouteGeneric>, ReqTypes extends {[K in keyof Api]: ReqGeneric}> = {
  [K in keyof Api]: ServerRoute<ReqTypes[K]>;
};

export function getGenericJsonServer<
  Api extends Record<string, RouteGeneric>,
  ReqTypes extends {[K in keyof Api]: ReqGeneric}
>(
  {routesData, getReqSerializers, getReturnTypes}: RouteGroupDefinition<Api, ReqTypes>,
  api: Api
): ServerRoutes<Api, ReqTypes> {
  const reqSerializers = getReqSerializers();
  const returnTypes = getReturnTypes();

  return mapValues(routesData, (routeDef, routeId) => {
    const routeSerdes = reqSerializers[routeId];
    const returnType = returnTypes[routeId as keyof ReturnTypes<Api>] as TypeJson<any> | null;

    return {
      // Convert '/states/{state_id}' into '/states/:state_id'
      url: toColonNotationPath(routeDef.url),
      method: routeDef.method,
      id: routeId as string,
      schema: routeSerdes.schema && getFastifySchema(routeSerdes.schema),

      handler: async function handler(req: ReqGeneric, resp): Promise<unknown | void> {
        const args: any[] = routeSerdes.parseReq(req as ReqTypes[keyof Api]);
        const data = (await api[routeId](...args)) as Resolves<Api[keyof Api]>;

        if (routeDef.statusOk !== undefined) {
          resp.statusCode = routeDef.statusOk;
        }

        if (returnType) {
          return returnType.toJson(data);
        } else {
          return {};
        }
      },
    };
  }) as any; // todo: likely related to fastify version upgrade
}
