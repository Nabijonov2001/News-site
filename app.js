const TelegramBot = require('node-telegram-bot-api')
const { TOKEN } = require('./config')
const Users = require('./models/userModel')
const { mongoConnection } = require('./monoose')
const translate = require('@vitalets/google-translate-api');
const bot = new TelegramBot(TOKEN, {
    polling:true
})

let langs = [ {text:'🇺🇿 O`zbekcha', callback_data:'uz'},{text:'🇷🇺 Ruscha', callback_data:'ru'},{ text:'🇬🇧 Ingilizcha', callback_data:'en'}]
let dataLang = {
    "uz":"O`zbekcha",
    "ru":"Ruscha",
    "en":"Ingilizcha"
}
// Database Connection
mongoConnection()

bot.on('message', async(message)=>{
    const userId = message.from.id
    const messageId = message.message_id
    const text = message.text
    

    let user = await Users.findOne({
        id:`${userId}`
    })
    if(!user || user.step == '0'){
        await Users.create({
            id:`${userId}`,
        }) 
        await bot.sendMessage(userId, 'Qaysi tildan tarjima qilmoqchisiz?',{
            reply_markup:{
                inline_keyboard:[langs]
            }     
        }) 
    }else if(text == '⬅️ Ortga'){
        await Users.findOneAndUpdate({id:userId},{
            step:'0',
        })
        await bot.sendMessage(userId, 'Qaysi tildan tarjima qilmoqchisiz?',{
            reply_markup:{
                inline_keyboard:[langs]
            }     
        }) 
    }else if(user.step == '2' && text !='/post'){
        const tarjima = await translate(text, {from:user.from, to:user.to})
        if(tarjima.text){
            await bot.sendMessage(userId, tarjima.text)
            // console.log(tarjima.text)
        }
       
    }
    const admin = "737195829"
    if(userId == admin){
        if(message.reply_to_message && text =='/post'){
            if(text == "/post"){
                let interval = 15/1000
                let userList = await Users.find()
                if(userList){
                    console.log(userList)
                }
                
                userList.forEach(user=>{
                    try {
                        setTimeout(async() => {
                        await bot.copyMessage(user.id, userId, message.reply_to_message.message_id, {
                                    // parse_mode: message.reply_to_message.parse_mode,
                                    reply_markup: message.reply_to_message.reply_markup
                                })
                        }, interval);
                    } catch (error) {
                        console.log('Jo`natishda xatolik')
                    }
                })
            }
        }
    }
   
})

bot.on('callback_query', async(message)=>{
    const userId = message.from.id
    const data = message.data

    let user = await Users.findOne({
        id:`${userId}`
    })

    if(user.step == 0){
        await Users.findOneAndUpdate({id:userId},{
            step:'1',
            from:data
        })
        await bot.deleteMessage(userId, message.message.message_id)
        await bot.sendMessage(userId, 'Qaysi tilga tarjima qilmoqchisiz?',{
            reply_markup:{
                inline_keyboard:[langs]
            }
        })
    }else if(user.step == 1){
        await Users.findOneAndUpdate({id:userId},{
            step:'2',
            to:data
        })
        let user = await Users.findOne({
            id:`${userId}`
        })
        await bot.deleteMessage(userId, message.message.message_id)
        await bot.sendMessage(userId, `Menga ixtiyoriy matnni tashlang. Men uni <b>${dataLang[user.from]}</b> dan <b>${dataLang[user.to]}</b> ga tarjima qilib beraman.`,{
            parse_mode:"HTML",
            reply_markup:{
                resize_keyboard:true,
                keyboard:[
                    [{text:"⬅️ Ortga"}]
                ]
            }
        })
    }
})