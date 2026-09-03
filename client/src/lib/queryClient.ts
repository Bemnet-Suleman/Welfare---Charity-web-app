import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { headers?: Record<string, string> }
): Promise<Response> {
  const isFormData = data instanceof FormData;
  const res = await fetch(url, {
    method,
    cache: "no-store",
    headers: isFormData ? options?.headers : (data ? { "Content-Type": "application/json", ...options?.headers } : options?.headers),
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const queryPath = queryKey.join("/") as string;
    const url = queryPath.startsWith("/")
      ? queryPath
      : queryPath.startsWith("api/")
      ? `/${queryPath}`
      : `/api/${queryPath}`;
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export async function fetchCurrentUser() {
  const res = await apiRequest("GET", "/api/me");
  const data = await res.json();
  return (data as any).user;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
