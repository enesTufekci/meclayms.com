import { AppContext, AppInitialProps } from "next/app";
import "../styles/main.css";

function MyApp({ Component, pageProps }: AppInitialProps & AppContext) {
  return <Component {...pageProps} />;
}

export default MyApp;
