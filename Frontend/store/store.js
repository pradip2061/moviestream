import { configureStore } from '@reduxjs/toolkit'
import getvideoReduce from './fetchvideo/fetchvideoSlice'
const store = configureStore({
   reducer:{
    getvideo:getvideoReduce
   }
})

export default store