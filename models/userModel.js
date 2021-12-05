const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id:{
        type:String,
        unique:true,
        required:true
    },
    step:{
        type:String,
        requred:true,
        default:'0'
    },
    from:{
        type:String,
    },
    to:{
        type:String,
    }
})

const Users = mongoose.model('user', userSchema)

module.exports = Users