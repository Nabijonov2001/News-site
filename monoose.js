const mongoose = require('mongoose')
const { MONGO_URL } = require('./config')

const mongoConnection = async()=>{
     try {
         mongoose.connect('mongodb://localhost/tarjimabot')
         console.log('Databasega ulanish bajarildi')
     } catch (error) {
         console.log('Databasega ulanishda xatolik', error)
     }
}


module.exports = {
    mongoConnection
}