const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const persons = require("./data/persons.json");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
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
const PORT = process.env.PORT || 3000;

app.get("/api/persons/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p> <p>${date.toString()}</p>`,
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (!person) response.status(404).json({ error: "Person not found" });
  response.json(person);
});

app.post("/api/persons", (request, response) => {
  const id = Math.floor(Math.random() * 100000000);

  if (!request.body.name || !request.body.number)
    return response.status(400).json({ error: "name and number are required" });

  if (persons.some((p) => p.name === request.body.name))
    return response.status(400).json({ error: "name must be unique" });

  if (persons.some((p) => p.number === request.body.number))
    return response.status(400).json({ error: "number must be unique" });

  const person = { id, ...request.body };
  persons.push(person);
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (!person) response.status(404).json({ error: "Person not found" });
  const index = persons.indexOf(person);
  persons.splice(index, 1);
  response.status(204).end();
});

app.listen(PORT);
console.log("Server running in port", PORT);
