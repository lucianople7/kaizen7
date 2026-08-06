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
  ACTION_INSTALLATION_KEY?: string;
  ACTION_WORKSPACE_KEY?: string;
  MISSION_STORE?: DurableObjectNamespaceLike;
}

const store = new InMemoryActionBridgeStore();

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const actionStore = env.MISSION_STORE
      ? new DurableObjectActionBridgeStore(env.MISSION_STORE, {
        installationKey: env.ACTION_INSTALLATION_KEY,
        workspaceKey: env.ACTION_WORKSPACE_KEY,
      })
      : store;
    const handler = createActionBridgeHandler(actionStore, {
      actionBearerToken: env.ACTION_BRIDGE_TOKEN,
      resolveAgentCredential: (presentedCredential) =>
        presentedCredential === env.ACTION_AGENT_TOKEN
          ? {
            ok: true,
            principal: {
              deviceId: env.ACTION_DEFAULT_DEVICE_ID ?? "mini-pc-001",
              credentialId: "cloudflare-device-credential",
            },
          }
          : { ok: false },
      bridgeVersion: "0.0.0",
      defaultTargetDeviceId: env.ACTION_DEFAULT_DEVICE_ID,
    });
    return handler(request);
  },
};

export { MissionStoreDurableObject };
