import { useSSR } from "@react-libraries/use-ssr";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import React from "react";

export interface Weather {
  publishingOffice: string;
  reportDatetime: Date;
  targetArea: string;
  headlineText: string;
  text: string;
}

const Page = () => {
  const router = useRouter();
  const id = router.query["id"];
  const [state, setState] = useSSR<Weather | null>(
    ["weather", String(id)] /*CacheKeyName*/,
    async (state, setState) => {
      // When this function finishes, the server side will finish processing and SSR will be performed.
      if (state !== undefined) return;
      setState(null);
      const result = await fetch(
        `https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${id}.json`
      )
        .then((r) => r.json())
        .catch(() => null);
      setState(result);
    }
  );
  return (
    <div>
      <button onClick={() => setState(undefined)}>Reload</button>
      {state && (
        <>
          <h1>{state.targetArea}</h1>
          <div>{new Date(state.reportDatetime).toLocaleString()}</div>
          <div>{state.headlineText}</div>
          <pre>{state.text}</pre>
        </>
      )}
      <div>
        <Link href="/">
          <a>戻る</a>
        </Link>
      </div>
    </div>
  );
};

export default Page;
