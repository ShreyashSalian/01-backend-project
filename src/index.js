// require("dotenv").config({path:"./env"});
import dotenv from "dotenv";
// import mongoose from 'mongoose';
// import {DB_NAME} from "./constants";
import connectDB from './db/index.js';
import { app } from "./app.js";
const port = process.env.PORT || 8000;

// dotenv.config({
//     path:"./env"
// });


connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`Server is running at port: ${port}`);
    });
    app.on("error",()=>{
        console.log("Error: ",error);
        throw error;
    });

}).catch((err)=>{
    console.log(`MONGODB connection failed!!!: `,err);
})
/*
import express from "express";
const app = express();

const port = process.env.PORT || 4000;

(async()=>{
    try{
        const connect = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        app.on("error",()=>{
            console.log("Error: ",error);
            throw error;
        });
        app.listen(port,()=>{
            console.log(`Connected to the database : ${port}`);
        })
    }catch(err){
        console.log("Errors: ",err);
        throw err;
    }

})()




*/
