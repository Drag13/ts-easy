import fetch from "cross-fetch";

const API = { USER: `http://localhost:4000/user` };

async function fetchApi<T>(url, options, mapper): Promise<T> {
  const fetchOptions = options ? { ...options } : {};

  if (fetchOptions.body && typeof fetchOptions.body !== "string") {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  if (!fetchOptions.headeres) {
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
