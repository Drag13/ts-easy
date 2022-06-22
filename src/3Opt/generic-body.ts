import fetch from "cross-fetch";

enum API {
  USER = `http://localhost:4000/user`,
}

interface IAppRequestInit<TBody> extends Omit<RequestInit, "body"> {
  body: TBody;
}

async function fetchApi<TBody extends object, TResult>(
  url: API,
  options?: IAppRequestInit<TBody>,
  mapper?
): Promise<TResult> {
  // typeof URLSearchParams = 'object'
  const fetchOptions = options
    ? { ...options, body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) }
    : ({} as RequestInit);

  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }

  if (!fetchOptions.headers["Content-Type"]) {
    fetchOptions.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, fetchOptions).then((x) => x.json());
  return mapper(response);
}

const userMapper = (data) => ({
  fullName: `${data.name} ${data.secondName}`,
  id: data.id,
});

(async function () {
  const result = await fetchApi<{ id: number }, ReturnType<typeof userMapper>>(
    API.USER,
    {
      method: "POST",
      body: { id: 5 },
    },
    userMapper
  );

  console.log(result.fullName);
})();

export default 0;
