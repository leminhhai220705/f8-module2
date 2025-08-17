class HttpRequest {
  baseUrl = "https://spotify.f8team.dev/api";

  async sendApi(restUrl, content = {}, method, opt = {}) {
    const wholeUrl = `${this.baseUrl}${restUrl}`;
    try {
      const res =
        method === "get" || method === "delete"
          ? await axios[method](wholeUrl, {
              ...opt,
            })
          : await axios[method](wholeUrl, content, {
              ...opt,
            });

      if (res.status >= 200 && res.status <= 299) {
        return res.data;
      } else {
        throw res;
      }
    } catch (error) {
      throw error;
    }
  }
}

const httpRequest = new HttpRequest();

export default httpRequest;
