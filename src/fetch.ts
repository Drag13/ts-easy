import fetch from "cross-fetch";
export enum API {
  USER = `http://localhost:4000/user`,
}

interface IAppRequestInit extends Omit<RequestInit, "body"> {
  body: any;
}

export async function fetchApi<T>(url: API, options: IAppRequestInit, mapper: (data: any) => T): Promise<T> {
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
