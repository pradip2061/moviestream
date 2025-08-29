const mongoose = require('mongoose')
const connectionstring= process.env.CONNECTION_STRING
const connectToDatabase =async()=>{
   try {
      await mongoose.connect(connectionstring)
     console.log('database connected successfully!')
   } catch (error) {
    console.log(error)
   }
}
module.exports = connectToDatabase