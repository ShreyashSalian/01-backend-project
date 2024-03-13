import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

//------- Setting the middleware and configuration-------------
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}));

// ======= for setting the limitation for the json data
//-------- The data can come from the form body, json etc(From form)------
//---------- Body parser is availabe inside the express by default----
app.use(express.json({
    limit:"16kb"
}))

//----------- whne the data is coming from the url(To avoid the special character being encoded)-------
app.use(express.urlencoded({
    extended:true, // object inside object
    limit:"16kb"
}));

//-------- for storing the data in file-------------
app.use(express.static("public"));


app.use(cookieParser());

// ------------------------------------------------------------

// ================== Routes ====================================
import userRouter from "./routes/user.routes.js";

// Routes declaration=======================

app.use("/api/v1/users",userRouter);

export {app};