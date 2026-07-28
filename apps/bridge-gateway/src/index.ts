import { createActionBridgeHandler } from "./action-gateway.ts";
import { InMemoryActionBridgeStore } from "./mission-store.ts";

export interface WorkerEnv {
  ACTION_BRIDGE_TOKEN: string;
  ACTION_AGENT_TOKEN: string;
}

const store = new InMemoryActionBridgeStore();

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const handler = createActionBridgeHandler(store, {
      actionBearerToken: env.ACTION_BRIDGE_TOKEN,
      agentBearerToken: env.ACTION_AGENT_TOKEN,
      bridgeVersion: "0.0.0",
    });
    return handler(request);
  },
};
