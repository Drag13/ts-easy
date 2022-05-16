import { API, fetchApi } from "./fetch";

(async function () {
  fetchApi(API.USER, { body: { id: 5 } }, () => ({ d: 123 }));
})();
