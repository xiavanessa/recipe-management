const fs = require("fs");
const handlebars = require("handlebars");

// Define the helper
handlebars.registerHelper("gt", function (a, b) {
  return a > b;
});

handlebars.registerHelper("add", function (a, b) {
  return a + b;
});
handlebars.registerHelper("sub", function (a, b) {
  return a - b;
});
handlebars.registerHelper("lt", function (a, b) {
  return a < b;
});

// Function to pre-render a template
function preRenderTemplate(templateFilePath, data, outputFilePath) {
  fs.readFile(templateFilePath, "utf8", function (err, source) {
    if (err) {
      no;
      console.log(err);
    } else {
      var template = handlebars.compile(source);
      var html = template(data);

      fs.writeFile(outputFilePath, html, function (err) {
        if (err) {
          console.log(err);
        }
        console.log("The file was saved!");
      });
    }
  });
}

// Data to be used for rendering
let data = { title: "recipe management", message: "Hello, World!" };

// Pre-render the template
preRenderTemplate("backend/views/index.handlebars", data, "index.html");
