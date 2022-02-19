const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
//const { stringify } = require("querystring");

const moviesIndexFilePath = "./moviesList.txt";
const moviesInfoFilePath = "./moviesInfo.txt";

var notFoundText = "Not Found";
var moviesTotal, moviesFound, moviesNotFound;

var movies = [];
var movieIDs = [];

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

const startProcess = async () => {
  try {
    await readMoviesList();

    console.log(">> Searching for IMDB Movie IDs. Please wait... ⏳");
    const result = await searchMovieID();
    //console.log(movieIDs);
    console.log(
      `Movie(s) ✅: ${moviesFound}, ❌: ${moviesNotFound} (Total: ${moviesTotal})`
    ); // emojiler WIN + . ile çıkıyor

    await getMovieInfo();
    var percent = ((moviesFound / moviesTotal) * 100).toFixed(2);
    console.log(
      `Movie(s) info stored: ${moviesFound} (Total: ${moviesTotal} / %${percent})`
    );
  } catch (err) {
    console.log("Error: ", err);
  }
};

async function readMoviesList() {
  let data = await fs.readFile(moviesIndexFilePath, "utf8");

  data = data.trim();
  data = data.replace(/[\r]/g, "");
  movies = data.split("\n");

  moviesTotal = movies.length;
  moviesFound = 0;
  moviesNotFound = 0;
}

/*
const readMoviesList = async () => {
  fs.readFileSync(moviesIndexFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    data = data.trim();
    data = data.replace(/[\r]/g, "");
    movies = data.split("\n");
  });
};
*/

async function searchMovieID() {
  try {
    let i;

    for (i = 0; i < movies.length; ++i) {
      //var requestUrl = "https://www.imdb.com/find?q=" + el + "&ref_=nv_sr_sm";
      var requestUrl =
        "http://www.imdb.com/find?q=" + movies[i].replace(/[ ]/g, "+");
      +"&s=tt&ttype=ft&ref_=fn_ft";

      const res = await axios({ method: "GET", url: requestUrl });
      const $ = cheerio.load(res.data);
      let info, link;

      info = $(
        `div[class="findSection"] > table[class="findList"] > tbody > tr > td[class="result_text"]`
      )
        .text()
        .replace(/[\t\r\n]/g, "")
        .trim();

      if (info.length === 0) {
        ++moviesNotFound;
        //console.log(`❌ Movie(s) Not Found: ${moviesNotFound}`); // emojiler WIN + . ile çıkıyor
        continue;
      }

      //ERR: BURADAKİ SEARCH KISMI ÇALIŞMIYOR GİBİ...
      if (info.search(movies[i])) {
        link = $(
          `div[class="findSection"] > table[class="findList"] > tbody > tr > td[class="result_text"] > a`
        ).attr("href");

        //moviesHitLinks.push(link);
        movieIDs.push(
          link.substring(link.indexOf("/title/") + 7, link.indexOf("/?ref"))
        );

        ++moviesFound;
        //console.log(`✅ Movie(s) Found: ${moviesFound}`);
      } else movieIDs.push(notFoundText);
    }
  } catch (err) {
    console.log("ERROR!", err);
  }
}

const getMovieInfo = async () => {
  try {
    let pos;
    let i;
    let movieInfoToWrite = [];
    let importingString;

    for (i = 0; i < movieIDs.length; ++i) {
      if (movieIDs[i].search(notFoundText) !== -1) continue;

      var requestUrl =
        "https://www.imdb.com/title/" + movieIDs[i] + "/reference";
      const res = await axios({ method: "GET", url: requestUrl });
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
      movieAgeRating = movieAgeRating.substring(
        0,
        movieAgeRating.indexOf("\n")
      );
      if (movieAgeRating.length === 0) movieAgeRating += "N/A";

      //---------------------------
      let movieDuration = $(
        `div[class="titlereference-header"] > div > ul[class="ipl-inline-list"] > li[class="ipl-inline-list__item"]`
        //`ul.ipl-inline-list:nth-child(8) > li:nth-child(2)`
      )
        .text()
        .replace(/[\n\t\r]/g, "");

      pos = movieDuration.match("h");
      if (pos) {
        movieDuration = movieDuration.substring(
          pos.index - 1,
          movieDuration.length
        );

        pos = movieDuration.match("min");
        if (pos) {
          movieDuration = movieDuration.substring(0, pos.index + 3);
        }
      } else {
        movieDuration = "N/A";
      }

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

      //---------------------------
      const movieDirector = $(
        //`section[class="titlereference-section-overview"] > div[class="titlereference-overview-section"] > ul[ipl-inline-list] > li[class="ipl-inline-list__item"] > a`
        `div.titlereference-overview-section:nth-child(3) > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1)`
      )
        .text()
        .trim();
      if (movieDirector === "") movieDirector += "N/A";

      //---------------------------
      const movieWriter = $(
        //`section[class="titlereference-section-overview"] > div[class="titlereference-overview-section"] > ul[ipl-inline-list] > li[ipl-inline-list__item] > a`
        `div.titlereference-overview-section:nth-child(4) > ul:nth-child(1) > li:nth-child(1)`
      )
        .text()
        .trim()
        .replace(/[\n]/g, "");
      if (movieWriter === "") movieWriter += "N/A";

      //---------------------------
      const moviePoster = $(
        `div[class="titlereference-header"] > div > a > img`
      ).attr("src");

      //---------------------------
      importingString = "";
      importingString = `-----------------------------\r\n(${
        i + 1
      }) ** MOVIE INFO **\r\n-----------------------------\r\n`;
      movieInfoToWrite += importingString;
      importingString = `Name: ${movieTitle} (${movieYear})\r\nIMDB ID: ${movieIDs[i]}\r\n`;
      movieInfoToWrite += importingString;
      importingString = `Age Rating: ${movieAgeRating}\r\nDuration: ${movieDuration}\r\nGenre: ${movieGenre}\r\n`;
      movieInfoToWrite += importingString;
      importingString = `Rating: ${movieRating}\r\nRank: ${movieRank}\r\n`;
      movieInfoToWrite += importingString;
      importingString = `Summary: ${movieSummary}\r\nDirector: ${movieDirector}\r\n`;
      movieInfoToWrite += importingString;
      importingString = `Writer: ${movieWriter}\r\nPoster: ${moviePoster}\r\n`;
      movieInfoToWrite += importingString;
      importingString = "-----------------------------\r\n\r\n\r\n";
      movieInfoToWrite += importingString;
      /*
      var percent = (((i + 1) / moviesFound) * 100).toFixed(2);
      console.log(
        `Movie info stored: ${i + 1}/${moviesFound} (%${percent})`
      );*/

      await fs.writeFile(
        moviesInfoFilePath,
        movieInfoToWrite,
        {
          encoding: "utf8",
          flag: "w",
          mode: 0o666,
        },
        //(err, data) => {
        (err) => {
          if (err) {
            console.log("💥ERROR: ", err);
          } //else {
          //console.log(data);
          //console.log("File written successfully...");
          //}
        }
      );
    }
  } catch (err) {
    console.log("ERROR!", err);
  }
};
//})(); //() ile fonksiyonu hemen çağırabiliyoruz

//.replace(/[&\/\\#,+()$~%.'":*?<>{}0-9\n]/g, ""); //istenmeyen karakterleri kaldır
//.replace(/[^a-zA-Z0-9 ]/g, "");
//.replace(/[^a-zA-Z0-9]/g, "");
//.replace(/[\n\t\r]/g, "");

startProcess();
