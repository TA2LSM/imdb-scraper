const axios = require("axios");
const cheerio = require("cheerio");

const movieUrl1 = "https://www.imdb.com/title/tt0088763/reference"; // Back to the Future
const movieUrl2 = "https://www.imdb.com/title/tt0145487/reference"; // Spider-Man
const movieUrl3 = "https://www.imdb.com/title/tt9603212/reference"; // Mission: Impossible 7
const movieUrl4 = "https://www.imdb.com/title/tt2322441/reference"; // Fifty Shades of Grey

const options = {
  method: "GET",
  url: movieUrl1,
};

const genres = [
  "Action",
  "Adult",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Film-Noir",
  "Game-Show",
  "History",
  "Horror",
  "Reality-TV",
  "Romance",
  "Short",
  "Mystery",
  "Music",
  "Musical",
  "News",
  "Western",
  "War",
  "Sci-Fi",
  "Sport",
  "Talk-Show",
  "Thriller",
];

/*
// MPAA ratings (1990)
const ageRatings = [
  "G", // General
  "PG", // Parental Guidance Suggested
  "PG-13", // Parents Strongly Cautioned
  "R", // Restricted
  "NC-17", // No Children 17 and Under Admitted
];
*/

let pos;

//.replace(/[&\/\\#,+()$~%.'":*?<>{}0-9\n]/g, ""); //istenmeyen karakterleri kaldır
//.replace(/[^a-zA-Z0-9 ]/g, "");
//.replace(/[^a-zA-Z0-9]/g, "");
//.replace(/[\n\t\r]/g, "");

//const getMovieInfo = async () => {
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

    movieTitle = movieTitle.substring(1);
    movieTitle = movieTitle.substring(0, movieTitle.indexOf("\n")).trim();

    //---------------------------
    let movieYear = $(
      `div[class="titlereference-header"] > div > h3 > span[class="titlereference-title-year"]`
    )
      .text()
      .replace(/[^0-9]/g, "");

    //---------------------------
    let movieAgeRating = $(
      `div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
      //`ul.ipl-inline-list:nth-child(8) > li:nth-child(1)`
    )
      .text()
      .replace(/[\t\r ]/g, "");

    movieAgeRating = movieAgeRating.substring(1, movieAgeRating.length);
    movieAgeRating = movieAgeRating.substring(0, movieAgeRating.indexOf("\n"));
    if (movieAgeRating.length === 0) movieAgeRating += "N/A";

    //---------------------------
    let movieDuration = $(
      `div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
      //`ul.ipl-inline-list:nth-child(8) > li:nth-child(2)`
    )
      .text()
      .replace(/[\n\t\r]/g, "");

    pos = movieDuration.match("h");
    movieDuration = movieDuration.substring(
      pos.index - 1,
      movieDuration.length
    );
    pos = movieDuration.match("min");
    movieDuration = movieDuration.substring(0, pos.index + 3);
    if (movieDuration.length === 0) movieDuration += "N/A";

    //---------------------------
    let movieGenre = [];
    let movieGenreStr = $(
      `div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
      //`ul.ipl-inline-list:nth-child(8) > li:nth-child(3)`
    )
      .text()
      .replace(/[\n ]/g, ""); //.attr("href");

    genres.forEach((el) => {
      pos = movieGenreStr.search(el);
      if (pos > -1) {
        movieGenre += movieGenreStr.substring(pos, pos + el.length) + ", ";
      }
    });
    if (movieGenre.length === 0) movieGenre += "N/A";
    else movieGenre = movieGenre.substring(0, movieGenre.length - 2);

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

    //---------------------------
    let movieSummary = $(
      //`section[class="titlereference-section-overview"] > div`
      `.titlereference-section-overview > div:nth-child(1)`
    )
      .text()
      .trim();
    if (movieSummary === "") movieSummary += "N/A";

    const moviePoster = $(
      `div[class="titlereference-header"] > div > a > img`
    ).attr("src");

    //---------------------------
    console.log(
      "-----------------------------\n** MOVIE INFO **\n-----------------------------"
    );
    console.log("Name: %s (%s)", movieTitle, movieYear);
    //console.log("Year:", movieYear);
    console.log("Age Rating:", movieAgeRating);
    console.log("Duration:", movieDuration);
    console.log("Genre:", movieGenre);
    console.log("Rating:", movieRating);
    console.log("Rank:", movieRank);
    console.log("Summary:", movieSummary);
    console.log("Poster:", moviePoster);
    console.log("-----------------------------");
  } catch (err) {
    console.log("ERROR!", err);
  }
})(); //() ile fonksiyonu hemen çağırabiliyoruz

//getMovieInfo();
