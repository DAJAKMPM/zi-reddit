import { CSSReset, ThemeProvider } from "@chakra-ui/core";
import { cacheExchange } from "@urql/exchange-graphcache";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import {
  CurrentUserDocument,
  CurrentUserQuery,
  LoginMutation,
  RegisterMutation,
} from "../generated/graphql";

import theme from "../theme";
import { updateQuery } from "../utils/updateQuery";

function MyApp({ Component, pageProps }: any) {
  const client = createClient({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include",
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        updates: {
          Mutation: {
            login: (_result, args, cache, info) => {
              updateQuery<LoginMutation, CurrentUserQuery>(
                cache,
                { query: CurrentUserDocument },
                _result,
                (result, query) => {
                  console.log(cache);
                  if (result.login.errors) {
                    console.log(result.login.errors, query);
                    return query;
                  } else {
                    return {
                      currentUser: result.login.user,
                    };
                  }
                }
              );
            },

            register: (_result, args, cache, info) => {
              updateQuery<RegisterMutation, CurrentUserQuery>(
                cache,
                { query: CurrentUserDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      currentUser: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      fetchExchange,
    ],
  });

  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
