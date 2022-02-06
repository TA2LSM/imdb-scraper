const axios = require("axios");
const cheerio = require("cheerio");

//const url = "https://www.imdb.com/title/tt0088763/reference"; // Back to the Future
//const url = "https://www.imdb.com/title/tt0145487/reference"; // Spider-Man
//const url = "https://www.imdb.com/title/tt9603212/reference"; // Mission: Impossible 7
const url = "https://www.imdb.com/title/tt2322441/reference"; //Fifty Shades of Grey

const options = {
  method: "GET",
  url, //buradaki url ismi değişmemeli. axios bu isimle arıyor çünkü!!!
};

//async function getMovieData() {
(async () => {
  try {
    const res = await axios(options);
    const $ = cheerio.load(res.data);

    //---------------------------
    let movieTitle = $(
      `div[class="titlereference-header"] > div > h3[itemprop="name"]`
      //`div.titlereference-header > div:nth-child(1) > h3:nth-child(3)`
    )
      .text()
      .replace(/[\t\r]/g, "");
    //.replace(/[&\/\\#,+()$~%.'":*?<>{}0-9\n]/g, ""); //istenmeyen karakterleri kaldır
    movieTitle = movieTitle.substring(1);
    movieTitle = movieTitle.substring(0, movieTitle.indexOf("\n")).trim();

    //---------------------------
    let movieYear = $(
      `div[class="titlereference-header"] > div > h3 > span[class="titlereference-title-year"]`
    )
      .text()
      //.replace(/[\n\t\r]/g, "");
      .replace(/[^0-9]/g, "");
    //.replace(/[^a-zA-Z0-9 ]/g, "");

    //---------------------------
    let movieDuration = $(
      `div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
      //`ul.ipl-inline-list:nth-child(8) > li:nth-child(2)`
    )
      .text()
      .replace(/[\n\t\r]/g, "");
    //  .trim()
    //  .substring(0, 50);
    //.replace(/[^a-zA-Z0-9]/g, "");
    if (movieDuration.indexOf("h") && movieDuration.indexOf("min")) {
      movieDuration = movieDuration
        .substring(
          movieDuration.indexOf("h") - 1,
          movieDuration.indexOf("min") + 3
        )
        .trim();
    } else movieDuration += "N/A";

    //---------------------------
    //let movieGenre = $();

    //---------------------------
    let movieAgeRating = $(
      `div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
      //`ul.ipl-inline-list:nth-child(8) > li:nth-child(1)`
    )
      .text()
      .replace(/[\t\r]/g, "");
    movieAgeRating = movieAgeRating.substring(1);
    movieAgeRating = movieAgeRating
      .substring(0, movieAgeRating.indexOf("\n"))
      .trim();
    if (movieAgeRating === "") movieAgeRating += "N/A";

    //---------------------------
    let movieSummary = $(
      //`section[class="titlereference-section-overview"] > div`
      `.titlereference-section-overview > div:nth-child(1)`
    )
      .text()
      .trim();
    if (movieSummary === "") movieSummary += "N/A";

    //---------------------------
    let movieRating = $(
      `ul[class=ipl-inline-list] > li > div > div > span[class="ipl-rating-star__rating"]`
    )
      .text()
      .trim();
    if (movieRating === "") movieRating += "N/A";

    //---------------------------
    let movieRank = $(
      `ul[class="ipl-inline-list"] > li[class=ipl-inline-list__item] > a[class=""]`
    )
      .text()
      .trim()
      .replace(/[^0-9]/g, "");
    if (movieRank === "") movieRank += "N/A";

    const moviePoster = $(
      `div[class="titlereference-header"] > div > a > img`
    ).attr("src");

    //---------------------------
    console.log(
      "-----------------------------\nMOVIE INFO\n-----------------------------"
    );
    console.log("Name: %s (%s)", movieTitle, movieYear);
    //console.log("Year:", movieYear);
    console.log("Duration:", movieDuration);
    console.log("Age Rating:", movieAgeRating);
    //console.log("Age Rating:", movieAgeRating);
    console.log("Summary:", movieSummary);
    console.log("Poster:", moviePoster);
    console.log("Rating:", movieRating);
    console.log("Rank:", movieRank);
    console.log("-----------------------------");
  } catch (err) {
    console.log("ERROR!");
  }
})(); //() ile fonksiyonu hemen çağırabiliyoruz

//getMovieData();
