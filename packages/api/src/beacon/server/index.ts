import {Api} from "../routes/index.js";
import {ServerInstance, ServerRoute, RouteConfig, registerRoute} from "../../utils/server/index.js";
import * as gossip from "./node.js";

// Re-export for convenience
export {RouteConfig};

export function registerRoutes(
  server: ServerInstance,
  api: Api,
  enabledNamespaces: (keyof Api)[]
): void {
  const routesByNamespace: {
    // Enforces that we are declaring routes for every routeId in `Api`
    [K in keyof Api]: () => {
      // The ReqTypes are enforced in each getRoutes return type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [K2 in keyof Api[K]]: ServerRoute<any>;
    };
  } = {
    // Initializes route types and their definitions
    gossip: () => gossip.getRoutes(api.gossip),
  };

  for (const namespace of enabledNamespaces) {
    const routes = routesByNamespace[namespace];
    if (routes === undefined) {
      throw Error(`Unknown api namespace ${namespace}`);
    }

    for (const route of Object.values(routes())) {
      registerRoute(server, route);
    }
  }
}
