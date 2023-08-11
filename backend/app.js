const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose')
const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors())
app.use(express.json())

//static files
app.use(express.static(path.join(__dirname, '../build')))

app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, '../build/index.html'))
})



const port = process.env.PORT;
const mongoURI = process.env.DATABASE;


mongoose.connect(mongoURI)
.then(()=>{
    console.log("connected to mongodb successfully")
}).catch((err)=>{
    console.log("error connecting mongodb", err)
})

// app.post('/api/auth/createUser', (req,res)=>{
//     res.send('hello bro')
// })
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port,()=>{
    console.log(`app is listening at port ${port}`)
})