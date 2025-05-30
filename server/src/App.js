import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true               // can send requests with cookies/auth headers for login sessions
}));

app.use(express.json({limit: "16kb"}));     // parse json data in body with 16 kb limit
app.use(express.urlencoded({extended: true, limit: "16kb"}));   // accepts encoded urls, can also parse nested objects
app.use(express.static("public"));  // use public folder as static storage
app.use(cookieParser());    // to parse and access cookies coming in HTTP request

export { app };