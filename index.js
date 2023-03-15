require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")
const app = express()

app.use(express.json())
morgan.token("content", function (req, res) {
  return JSON.stringify(req.body)
})
app.use(express.static("build"))

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
)

app.use(cors())

app.get("/", (request, response) => {
  response.send("<h2>Hello World!</h2>")
})

app.get("/info", (request, response) => {
  let time = Date()
  let count = persons.length
  response.send(`<p>Phonebook has info for ${count} people</p> ${time}`)
})

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.post("/api/persons", (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "person needs both a name and a number",
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      console.log(error)
      response.status(400).send({ error: "malformatted id" })
    })
})

app.delete("/api/persons/:id", (request, response) => {
  console.log(request.params)
  Person.findByIdAndRemove(request.params.id).then((result) => {
    response.status(204).end()
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
