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
