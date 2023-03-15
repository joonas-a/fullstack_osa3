require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")
const app = express()

app.use(express.static("build"))
app.use(express.json())
app.use(cors())

morgan.token("content", function (req) {
  return JSON.stringify(req.body)
})

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
)

// show total number of entried in the db and current time
app.get("/info", (request, response) => {
  let time = Date()
  Person.countDocuments({}).then((count) => {
    response.send(`<p>Phonebook has info for ${count} people</p> ${time}`)
  })
})

// load the whole phonebook
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

// add a new person
app.post("/api/persons", (request, response, next) => {
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

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

// update number for a person
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

// get individual person
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// delete a person
app.delete("/api/persons/:id", (request, response, next) => {
  console.log(request.params)
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)
