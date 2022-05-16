import fetch from "cross-fetch";
const API = { USER: `http://localhost:4000/user` };

interface IAppRequestInit<TBody extends object> extends Omit<RequestInit, "body"> {
  body: TBody;
}

async function fetchApi<TBody extends object, TResult>(url, options: IAppRequestInit<TBody>, mapper: (data: any) => TResult): Promise<TResult> {
  const fetchOptions = {...options, body: JSON.stringify(options.body)}

  if (!options.headers) {
    options.headers = {};
  }

  if (!options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, fetchOptions).then((x) => x.json());
  return mapper(response);
}

const userMapper = (data) => ({
  fullName: `${data.name} ${data.secondName}`,
  id: data.id,
});

(async function () {
  const result = await fetchApi<{id: number}, ReturnType<typeof userMapper>>(
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
