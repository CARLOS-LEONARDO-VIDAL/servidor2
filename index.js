// index.js
require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const app = express()
const cors = require("cors")
app.use(express.static('dist'))
 
 
app.use(cors())
app.use(express.json())
 
morgan.token('body', (req) => {
    return (req.method === 'POST' || req.method === 'PUT') ? JSON.stringify(req.body) : ''
})
 
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
 
const Person = require('./models/person')
 
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:', request.path);
    console.log('Body', request.body);
    console.log('----------------');
    next()
}
app.use(requestLogger)
 
 
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})
 
// devolver todos
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})
 
// info
app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count => {
        const date = new Date()
        response.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
    })
})
 
// obtener por id
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).json({ error: 'Person not found' })
        }
    })
    .catch(error => next(error))
})
 
// eliminar
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})
 
// crear
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ error: 'Name is missing' })
    }
    if (!body.number) {
        return response.status(400).json({ error: 'Number is missing' })
    }
 
    const person = new Person({
        name: body.name,
        number: body.number
    })
 
    person.save()
    .then(saved => {
        response.json(saved)
    })
    .catch(error => next(error))
})
 
// actualizar número (manteniendo comportamiento: actualizar sólo número)
app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body
 
    const updated = {
        number: body.number
    }
 
    Person.findByIdAndUpdate(id, updated, { new: true })
    .then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).json({ error: 'Person not found' })
        }
    })
    .catch(error => next(error))
})
 
const unknownEndpoint = (request, response, next) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
 
const errorHandler = (error, request, response, next) => {
    console.log('ERROR', error.message);
    if (error.name === "CastError") {
        return response.status(400).send({ error: 'id not found' })
    }
    next(error)
}
app.use(errorHandler)
 
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})