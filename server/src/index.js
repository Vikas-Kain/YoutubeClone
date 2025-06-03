import connectDB from './db/index.js';
import { app } from './App.js';
import dotenv from 'dotenv';

dotenv.config({path: './server/env'});

const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.on("errror", (error) => {
        console.log('Error seting up server:', error);
        throw error;
    })
    app.listen(port, () => {
        console.log(`App serving at http://localhost:${port}`);
    })
})
.catch((err) => {
    console.log('Error connecting DB:', err);
})



/*
// connecting DB inside index file with iffy function (can also define a function and call it)

import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';

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