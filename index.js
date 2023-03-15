const express = require("express")
const morgan = require("morgan")
const app = express()

app.use(express.json())
morgan.token("content", function (req, res) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
)

let persons = [
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 1,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 2,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 3,
  },
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 4,
  },
]

app.get("/", (request, response) => {
  response.send("<h2>Hello World!</h2>")
})

app.get("/info", (request, response) => {
  let time = Date()
  let count = persons.length
  response.send(`<p>Phonebook has info for ${count} people</p> ${time}`)
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.post("/api/persons", (request, response) => {
  const person = request.body
  if (!person.name || !person.number) {
    return response.status(400).json({
      error: "person needs both a name and a number",
    })
  } else if (persons.find((p) => p.name === person.name)) {
    return response.status(400).json({
      error: "name must be unique",
    })
  }
  const id = Math.floor(Math.random() * 10 ** 6)
  person.id = id
  persons = persons.concat(person)
  response.json(person)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  if (!person) {
    return response.status(404).json({
      error: "person not found",
    })
  }
  response.json(person)
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
