const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectToDatabase = require('./database')
const uploadRoute = require('./router/uploadRoute')
const fetchRouter = require('./router/fetchVideoRouter')
const searchRouter = require('./router/SearchRouter')
const app = express()
app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));
 app.use(cors({
    origin:'https://moviestream-lilac.vercel.app'
 }))
 connectToDatabase()

app.use('/videostream',uploadRoute)
app.use('/videostream',fetchRouter)
app.use('/videostream',searchRouter)

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`the project running at http://localhost:${PORT}`)
})