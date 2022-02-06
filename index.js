const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.imdb.com/title/tt0088763/reference";

const options = {
  method: "GET",
  url, //buradaki url ismi değişmemeli. axios bu isimle arıyor çünkü!!!
};

//async function getMovieData() {
(async () => {
  try {
    const res = await axios(options);
    //console.log(res.data);

    const $ = cheerio.load(res.data);
    const movieTitle = $(
      `div[class="titlereference-header"] > div > h3[itemprop="name"]`
      //`div.titlereference-header > div:nth-child(1) > h3:nth-child(3)`
    )
      .text()
      .trim()
      .replace(/[&\/\\#,+()$~%.'":*?<>{}0-9\n]/g, ""); //istenmeyen karakterleri kaldır

    const movieYear = $(
      `div[class="titlereference-header"] > div > h3 > span[class="titlereference-title-year"]`
    )
      .text()
      .trim()
      .replace(/[^0-9]/g, "");
    //.replace(/[^a-zA-Z0-9 ]/g, "");

    const movieDuration = $(
      //`div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
      `ul.ipl-inline-list:nth-child(8) > li:nth-child(2)`
    )
      .text()
      .trim();

    const movieSummary = $(
      //`section[class="titlereference-section-overview"] > div`
      `.titlereference-section-overview > div:nth-child(1)`
    )
      .text()
      .trim();

    const movieRating = $(
      `ul[class=ipl-inline-list] > li > div > div > span[class="ipl-rating-star__rating"]`
    )
      .text()
      .trim();

    const movieRank = $(
      `ul[class="ipl-inline-list"] > li[class=ipl-inline-list__item] > a[class=""]`
    )
      .text()
      .trim()
      .replace(/[^0-9]/g, "");

    const moviePoster = $(
      `div[class="titlereference-header"] > div > a > img`
    ).attr("src");

    console.log("Name:", movieTitle);
    console.log("Year:", movieYear);
    console.log("Duration:", movieDuration);
    console.log("Summary:", movieSummary);
    console.log("Poster:", moviePoster);
    console.log("Rating:", movieRating);
    console.log("Rank:", movieRank);
  } catch (err) {
    console.log("ERROR!");
  }
})(); //() ile fonksiyonu hemen çağırabiliyoruz

//getMovieData();
