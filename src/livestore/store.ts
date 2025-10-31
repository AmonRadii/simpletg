import { makePersistedAdapter } from "@livestore/adapter-web";
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker";
import { getStore } from "@livestore/solid";
import LiveStoreWorker from "./livestore.worker?worker";

import { schema } from "./schema";
import { Store } from "@livestore/livestore";
import { Accessor, createSignal } from "solid-js";

export const adapterFactory = makePersistedAdapter({
  storage: { type: "opfs" },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
});

export const store: Accessor<Store<typeof schema> | undefined> = await getStore<
  typeof schema
>({
  adapter: adapterFactory,
  schema,
  storeId: "default",
});

console.log("Reached");