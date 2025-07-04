import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Walmart Clone - Save Money. Live Better." />
        <meta name="theme-color" content="#0071DC" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}