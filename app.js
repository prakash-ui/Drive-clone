const express = require('express');
const userRouter = require('./routes/user.routes');

const dotenv = require('dotenv');
dotenv.config();

const connectToDB = require('./config/db')
connectToDB();

const cookieparser = require('cookie-parser')

const app = express();

const indexRouter = require('./routes/index.router')

app.set('view engine', 'ejs');
app.use(cookieparser())
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use('/',indexRouter)

app.use('/user',userRouter)

app.listen(3000, ()=> {
    console.log('server is running at port 3000')
})