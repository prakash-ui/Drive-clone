const express = require('express');
const userRouter = require('./routes/user.routes');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

const connectToDB = require('./config/db');
connectToDB();

const cookieParser = require('cookie-parser'); // Fixed: Correct import with 'cookieParser'

const app = express();

const indexRouter = require('./routes/index.router');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser()); // Fixed: Use the correctly imported 'cookieParser'

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', indexRouter);
app.use('/', userRouter);

app.listen(3000, () => {
    console.log('server is running at port 3000');
});