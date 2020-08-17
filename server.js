const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const mongoose = require('mongoose');

mongoose.Promise = Promise

//express renders static files from the root directory i.e index.html
app.use(express.static(__dirname))

//middleware to be able to use bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//define mongoose schema
var Message = mongoose.model("Message",{
    name:String,
    message:String
})

//this route fetches messages from our database and display it for frontend to recieve
app.get('/messages', (req, res) =>{
    Message.find({}, (err, messages)=>{
        res.send(messages)
    })
    
})

//this route fetches messages from our database and display it for frontend to recieve
app.get('/messages/:user', (req, res) =>{
    var user = req.params.user
    Message.find({name:user}, (err, messages)=>{
        res.send(messages)
    })
    
})


// post new message to the database and uses socket.io to request  new data on http request without refreshing
app.post('/messages', (req, res) => {
    //passing our object into the schema
    var message = new Message(req.body)

    //save to database with error callback
    message.save((err) => {
        if (err)
            sendStatus(500)

        io.emit('message', req.body)
        res.sendStatus(200)
    })

})

//alternate post route with error been displayed and nested callback(AKA callback hell)
// app.post('/messages', (req, res) => {
//     //passing our object into the schema
//     var message = new Message(req.body)

//     message.save((err) => {
//         if (err)
//             sendStatus(500)

//         Message.findOne({message: 'badword'}, (err, censored) => {
//             if(censored) {
//                 console.log('censored words found', censored)
//                 Message.remove({_id: censored.id}, (err) =>{
//                     console.log('removed censored message')
//                 })
//             }
//         })

//         //socket io event
//         io.emit('message', req.body)
//         res.sendStatus(200)
//     })
// })

//alternate code of post route using ES6 promise
// app.post('/messages', (req, res) => {
//     var message = new Message(req.body)

//     message.save()
//     .then(() => {
//         console.log('saved')
//         return Message.findOne({message: 'badword'})
//     })
//     .then( censored => {
//         if(censored) {
//             console.log('censored words found', censored)
//             return Message.remove({_id: censored.id})
//         }
//         io.emit('message', req.body)
//         res.sendStatus(200)
//     })
//     .catch((err) => {
//         res.sendStatus(500)
//         return console.error(err)
//     })
// })


//alternate code of post route using ES6 Asycn/Await and try/Catch
// app.post('/messages', async (req, res) => {
//     try {
//         var message = new Message(req.body)
//         var savedMessage = await message.save()
//         console.log('saved')
//         var censored = await Message.findOne({ message: 'badword' })
//         if (censored)
//             await Message.remove({ _id: censored.id })
//         else
//             io.emit('message', req.body)

//         res.sendStatus(200)
//     } catch (error) {
//         res.sendStatus(500)
//         return console.error(error)
//     }
// })

io.on("connection", (socket) =>{
    console.log("a user connected")
})

//database connection to mongoose
const mongoDB = 'mongodb://127.0.0.1/learning_node';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//express connection to server but this time using socket http
var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})
