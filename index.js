// index.js
require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const path = require("path")
const app = express()

const Person = require('./models/person')

// Middleware
app.use(cors())
app.use(express.json())

// Servir React desde 'dist'
app.use(express.static(path.join(__dirname, 'dist')))

// Morgan logging
morgan.token('body', (req) =>
  req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : ''
)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Logger personalizado
app.use((req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('----------------')
  next()
})

// =====================
// RUTAS API
// =====================

// Obtener todos los contactos
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons))
})

// Información de la agenda
app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const date = new Date()
    res.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
  })
})

// Obtener contacto por id
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person)
      else res.status(404).json({ error: 'Person not found' })
    })
    .catch(error => next(error))
})

// Crear contacto
app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body
  if (!name) return res.status(400).json({ error: 'Name is missing' })
  if (!number) return res.status(400).json({ error: 'Number is missing' })

  const person = new Person({ name, number })
  person.save()
    .then(saved => res.json(saved))
    .catch(error => next(error))
})

// Actualizar número
app.put('/api/persons/:id', (req, res, next) => {
  const { number } = req.body
  Person.findByIdAndUpdate(req.params.id, { number }, { new: true })
    .then(person => {
      if (person) res.json(person)
      else res.status(404).json({ error: 'Person not found' })
    })
    .catch(error => next(error))
})

// Eliminar contacto
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

// =====================
// Rutas desconocidas / frontend
// =====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// =====================
// Manejador de errores
// =====================
app.use((error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'id not found' })
  }
  next(error)
})

// =====================
// Levantar servidor
// =====================
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
