// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    var randRot = Math.floor(Math.random() * 7) - 3;
    var newArticle = $(`<div class="article-html" data-id="${data[i]._id}">`).css(`transform`, `rotate(${randRot}deg)`);
    if (data[i].summary) {
      $("#articles").append(
        newArticle.html(
          `<p class="headline"> <a href="${data[i].link}" target="_blank">${data[i].title}</a></p>
    <p class="summary">${data[i].summary}</p>`)
      );
    }else {
      $("#articles").append(
        newArticle.html(
          `<p class="headline"> <a href="${data[i].link}" target="_blank">${data[i].title}</a></p>`)
      );
    }
  }
});


// Whenever someone clicks a p tag
$(document).on("click", ".article-html", function () {
  // Empty the notes from the note section
  $("#new-note").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#new-note").append("<div class='note-header'><h2>" + data.title + "</h2></div>");
      // An input to enter a new title
      $("#new-note").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#new-note").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#new-note").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        data.findAll({note}), function (error, dbnotes) {
        $("#notes").prepend(`<div class="prevnote"><h3>${dbnotes.title}</h3><p>${dbnotes.body}</div>`);}
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#new-note").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
