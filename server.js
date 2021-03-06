var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
var mongoConnect = process.env.MONGODB_URI || "mongodb://localhost/newsClippings"
mongoose.connect(mongoConnect);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.story").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h2.story-heading")
        .children("a")
        .text();
      result.link = $(this)
        .children("h2.story-heading")
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children(".summary")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Clipping complete");
  });
  res.redirect("/");
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}).then(function (data) {
    res.json(data)
  });
});

// Route for grabbing a specific Article by id, populate it with its notes
app.get("/articles/:id", function (req, res) {
  // Route finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({
    _id: req.params.id
  }).populate("note")
    .then(function (articleAndNote) {
      res.json(articleAndNote);
      console.log(articleAndNote)
    })
    .catch(function (err) {
      console.log(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update its "note" property with the _id of the new note
  db.Note.create(req.body)
    .then(function (dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id },
        { $push: { note: dbNote } }, { new: true })
    }).then(function (updatedArticle) {

      res.json(updatedArticle)
    });

});

//FOR DELETING NOTES
app.get("/note", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Note.find({}).then(function (data) {
    res.json(data)
  });
});
app.get("/note/:id", function (req, res) {
  // Route finds one note using the req.params.id
  db.Article.findOne({
    _id: req.params.id
  }).then(function (dbNote) {
    res.json(dbNote);
  })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/note/:id", function (req, res) {
  db.Note.deleteOne({ _id: req.params.id }).then(function (notesDoc) {
    }).then(function () {
        res.redirect("/");
      });
  
});
//END NOTE DELETE STUFF

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
