export const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const fetcherToken = (url: string, token: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
