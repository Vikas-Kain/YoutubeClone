import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';
import express from 'express';
// import dotenv from 'dotenv';

// dotenv.config({path: './server/env'});

// const app = express();

connectDB();



/*
// connecting DB inside index file with iffy function (can also define a function and call it)
const port = process.env.PORT || 8000;

( async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`DB connected, DB HOST: ${connectionInstance.connection.host}`)

        app.on("errror", (error) => {
            console.log("ERROR: ", error);
        });

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        })
    }
    catch (error){
        console.log("ERROR: ", error);
        throw error;
    }
})()
*/