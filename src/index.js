// require("dotenv").config({path:"./env"});
import dotenv from "dotenv";
// import mongoose from 'mongoose';
// import {DB_NAME} from "./constants";
import connectDB from './db/index.js';
// dotenv.config({
//     path:"./env"
// });


connectDB();
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
