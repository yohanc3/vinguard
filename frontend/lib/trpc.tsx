import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink, splitLink, unstable_httpSubscriptionLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { useState, type ReactNode } from "react"
import type { AppRouter } from "@vinguard-backend/trpc/root"

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

const apiUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/trpc"

export function TrpcQueryProvider(props: { children: ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(function createTrpcClient() {
    return createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: function isSubscription(op) {
            return op.type === "subscription"
          },
          true: unstable_httpSubscriptionLink({
            url: apiUrl,
          }),
          false: httpBatchLink({
            url: apiUrl,
          }),
        }),
      ],
    })
  })

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
