import fetch from "cross-fetch";

enum API {
  USER = `http://localhost:4000/user`,
}

interface IAppRequestInit extends RequestInit {
  body: any;
}

async function fetchApi<T>(
  url: API,
  options?: IAppRequestInit,
  mapper?: (x: unknown) => T
): Promise<T> {
  const fetchOptions = options ? { ...options } : ({} as RequestInit);

  if (typeof fetchOptions.body !== "string") {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }

  if (!fetchOptions.headers["Content-Type"]) {
    fetchOptions.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, fetchOptions).then((x) => x.json());
  return typeof mapper === "function" ? mapper(response) : response;
}

const userMapper = (data) => ({
  fullName: `${data.name} ${data.secondName}`,
  id: data.id,
});

(async function () {
  const result = await fetchApi(
    API.USER,
    {
      method: "POST",
      body: { id: 5 },
    },
    userMapper
  );

  console.log(result);
})();
