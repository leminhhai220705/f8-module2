import httpRequest from "./httpRequest.js";

class ArtistsHandlingData {
  constructor() {}

  async getAllArtists() {
    const allArtists = await httpRequest.sendApi(
      "/artists?limit=20&offset=0",
      null,
      "get",
    );

    return allArtists;
  }
}

const artistsApi = new ArtistsHandlingData();

export default artistsApi;
