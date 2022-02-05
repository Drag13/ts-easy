import fetch from "cross-fetch";
const API = { USER: `http://localhost:4000/user` };

interface IAppRequestInit extends RequestInit {
  body: any;
}

async function fetchApi<T>(url, options: IAppRequestInit, mapper: (data: any) => T): Promise<T> {
  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }

  if (!options.headers) {
    options.headers = {};
  }

  if (!options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, options).then((x) => x.json());
  return typeof mapper === "function" ? mapper(response) : response;
}

const userMapper = (data) => ({
  fullName: `${data.name} ${data.secondName}`,
  id: data.id,
});

(async function () {
  const result = await fetchApi<{ fullName: string }>(
    API.USER,
    {
      method: "POST",
      body: { id: 5 },
    },
    userMapper
  );

  console.log(result);
})();

export default 0;
