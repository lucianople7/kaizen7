import { createActionBridgeHandler } from "./action-gateway.ts";
import {
  DurableObjectActionBridgeStore,
  DurableObjectNamespaceLike,
  MissionStoreDurableObject,
} from "./durable-object-store.ts";
import { InMemoryActionBridgeStore } from "./mission-store.ts";

export interface WorkerEnv {
  ACTION_BRIDGE_TOKEN: string;
  ACTION_AGENT_TOKEN: string;
  ACTION_DEFAULT_DEVICE_ID?: string;
  MISSION_STORE?: DurableObjectNamespaceLike;
}

const store = new InMemoryActionBridgeStore();

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const actionStore = env.MISSION_STORE
      ? new DurableObjectActionBridgeStore(env.MISSION_STORE)
      : store;
    const handler = createActionBridgeHandler(actionStore, {
      actionBearerToken: env.ACTION_BRIDGE_TOKEN,
      agentBearerToken: env.ACTION_AGENT_TOKEN,
      bridgeVersion: "0.0.0",
      defaultTargetDeviceId: env.ACTION_DEFAULT_DEVICE_ID,
    });
    return handler(request);
  },
};

export { MissionStoreDurableObject };
