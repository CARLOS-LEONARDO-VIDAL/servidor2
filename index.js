const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

// Logger
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:', request.path);
  console.log('Body:', request.body);
  console.log('----------------');
  next();
};
app.use(requestLogger);

// Fake DB
let persons = [
  { id: 1, name: 'Arto Hellas', number: '040-123456' },
  { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
  { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
];

app.get('/', (req, res) => {
  res.send('<h1>API REST - Phonebook</h1>');
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  const date = new Date();
  res.send(`
    <p>Phonebook tiene info de ${persons.length} personas</p>
    <p>${date}</p>
  `);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);

  if (!person) {
    return res.status(404).json({ error: 'Persona no encontrada' });
  }

  res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

// ✅ POST
app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Nombre y número requeridos' });
  }

  const existing = persons.find(p => p.name === body.name);
  if (existing) {
    return res.status(400).json({
      error: `El nombre '${body.name}' ya está en la agenda`
    });
  }

  const person = {
    id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  };

  persons = persons.concat(person);
  res.json(person);
});

// ✅ PUT (actualizar número)
app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;

  const person = persons.find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: 'Persona no encontrada' });
  }

  const updatedPerson = { ...person, number: body.number };
  persons = persons.map(p => p.id === id ? updatedPerson : p);
  res.json(updatedPerson);
});

// middleware 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta desconocida' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
