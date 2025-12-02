require('dotenv').config()
const mongoose = require('mongoose')


const listMode = process.argv.length === 2

const addMode = process.argv.length === 4

if (!listMode && !addMode) {
  console.log('Uso correcto:')
  console.log('  Para listar: node mongo.js')
  console.log('  Para agregar: node mongo.js <name> <number>')
  process.exit(1)
}


const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)


const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)


if (listMode) {
  Person.find({}).then(result => {
    console.log('📒 Phonebook:')
    result.forEach(p => console.log(`${p.name} ${p.number}`))
    mongoose.connection.close()
  })
  return
}


if (addMode) {
  const name = process.argv[2]
  const number = process.argv[3]

  const person = new Person({ name, number })

  person.save().then(() => {
    console.log(`✔ Agregado: ${name} (${number}) a la agenda`)
    mongoose.connection.close()
  })
}
