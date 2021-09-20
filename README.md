# next-weather

## overview

SSR sample using Next.js

## Operation check link

<https://next-weather-opal.vercel.app/>

## Code

- src/pages/_app.tsx

SSR用にサーバ上でgetDataFromTreeを実行し、クライアントに送るデータを作成する

```tsx
import {
  CachesType,
  createCache,
  getDataFromTree,
} from "@react-libraries/use-ssr";

import { AppContext, AppProps } from "next/app";

const App = (props: AppProps & { cache: CachesType }) => {
  const { Component, cache } = props;
  createCache(cache);
  return <Component />;
};
App.getInitialProps = async ({ Component, router, AppTree }: AppContext) => {
  const cache = await getDataFromTree(
    <AppTree Component={Component} pageProps={{}} router={router} />
  );
  return { cache };
};
export default App;

```

- src/pages/index.tsx

useSSRを使い、SSRの対象になるデータをsetStateする  
サーバ上で作成されたstateは、クライアントへ送られる  
また、クライアント上ではコンポーネントがアンマウントされた後も、明示的にstateをクリアしない限りキャッシュされる  

```tsx
import React from "react";
import Link from "next/link";
import { useSSR } from "@react-libraries/use-ssr";

interface Center {
  name: string;
  enName: string;
  officeName?: string;
  children?: string[];
  parent?: string;
  kana?: string;
}
interface Centers {
  [key: string]: Center;
}
interface Area {
  centers: Centers;
  offices: Centers;
  class10s: Centers;
  class15s: Centers;
  class20s: Centers;
}

const Page = () => {
  const [state, setState] = useSSR<Area | null>(
    "area",
    async (state, setState) => {
      if (state !== undefined) return;
      setState(null);
      const result = await fetch(
        `https://www.jma.go.jp/bosai/common/const/area.json`
      )
        .then((r) => r.json())
        .catch(() => null);
      setState(result);
    }
  );
  return (
    <div>
      <button onClick={() => setState(undefined)}>Reload</button>
      {state &&
        Object.entries(state.offices).map(([code, { name }]) => (
          <div key={code}>
            <Link href={`/weather/${code}`}>
              <a>{name}</a>
            </Link>
          </div>
        ))}
    </div>
  );
};
export default Page;
```

- src/pages/weather/[id].tsx

useSSRでは保存データにKeyを設定する必要がある  
`["weather", String(id)]`のように、配列でキーを設定することも可能  

```tsx
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
```
