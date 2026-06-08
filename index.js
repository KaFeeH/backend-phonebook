require("dotenv").config();
const Person = require("./models/person");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.static("dist"));
app.use(cors());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  }),
);

const date = new Date();
const PORT = process.env.PORT || 3001;

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.send(
        `<p>Phonebook has info for ${result.length} people</p> <p>${date.toString()}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (!person) {
        response.status(404).json({ error: "Person not found" });
      } else {
        response.json(person);
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      next(error)});
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then((result) => {
      if (!result) {
        response.status(404).json({ error: "Person not found" });
      } else {
        response.status(204).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const updatedData = {
    name: request.body.name,
    number: request.body.number,
  };
  Person.findByIdAndUpdate(id, updatedData, { new: true, context: "query", runValidators: true })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        response.status(404).json({ error: "Person not found" }).end();
      } else {
        response.json(updatedPerson);
      }
    })
    .catch((error) => {
      console.log(error);
      next(error)});
});

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error("Error:", error.message);
  switch (error.name) {
    case "CastError":
      return response.status(400).json({ error: "Malformatted id" });
    case "SyntaxError":
      return response.status(400).json({ error: "Invalid JSON" });
    case "ValidationError":
      return response.status(400).json({ error: error.message || "Validation error" });
    default:
      return response
        .status(500)
        .json({ error: "Internal server error" });
  }
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
