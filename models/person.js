const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('Conectando a MongoDB...')

mongoose.connect(url)
  .then(() => {
    console.log('Conectado a MongoDB')
  })
  .catch((error) => {
    console.log('Error conectando a MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Person', personSchema)
