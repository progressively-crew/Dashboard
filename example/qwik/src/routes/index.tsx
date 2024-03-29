import { loader$ } from "@builder.io/qwik-city";
import {
  component$,
  useBrowserVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import type { FlagDict } from "@progressively/server-side";
import { getProgressivelyData } from "@progressively/server-side";
import { Progressively } from "@progressively/sdk-js";

export const useFlags = loader$(async ({ cookie }) => {
  const id = cookie.get("progressively-id");

  const { data, userId } = await getProgressivelyData("valid-sdk-key", {
    websocketUrl: "ws://localhost:4000",
    apiUrl: "http://localhost:4000",
    fields: {
      id: id?.value,
    },
  });

  cookie.set("progressively-id", userId);

  return data;
});

export default component$(() => {
  const signal = useFlags();
  const flags = useSignal<FlagDict>(signal.value.initialFlags || {});

  useBrowserVisibleTask$(
    async () => {
      const sdk = Progressively.init(signal.value.clientKey, signal.value);

      sdk.onFlagUpdate((nextFlags: FlagDict) => {
        flags.value = nextFlags;
      });

      return () => {
        sdk.disconnect();
      };
    },
    { strategy: "document-ready" }
  );

  return (
    <main>
      <div>
        <h1>New homepage</h1>
        {flags.value.newHomepage ? "New variant" : "Old variant"}
      </div>

      <footer>{flags.value.newFooter ? "New footer" : "Old footer"}</footer>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
