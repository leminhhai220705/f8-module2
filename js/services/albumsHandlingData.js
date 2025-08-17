import httpRequest from "./httpRequest.js";

class albumsHandlingData {
  constructor() {}

  async getAllAlbums() {
    try {
      const allAlbums = await httpRequest.sendApi(
        "/albums?limit=20&offset=0",
        null,
        "get",
      );
      return allAlbums;
    } catch (error) {
      console.log(error);
    }
  }
}

const albumsApi = new albumsHandlingData();

export default albumsApi;
