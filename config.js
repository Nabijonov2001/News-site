const result = require('dotenv')
result.config()

module.exports = {
    MONGO_URL : process.env.MONGO_URL,
    TOKEN:process.env.TOKEN
}