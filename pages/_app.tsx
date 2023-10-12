import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import { SessionProvider } from "next-auth/react"

import '@/styles/globals.css';
import '@/pages/agent/test_login/style.css';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps: { session, ...pageProps } }: AppProps<{}>) {
  const queryClient = new QueryClient();

  return (
    <div className={inter.className}>

      <Toaster />
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
      </QueryClientProvider>
    </div>
  );
}

export default appWithTranslation(App);
