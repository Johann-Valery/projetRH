const express = require('express');
const twig = require('twig');
const mongoose = require('mongoose');
const session = require('express-session');

const mainRouter = require('./router/mainRouter');
const companyRouter = require('./router/companyRouter');
const employeeRouter = require('./router/employeeRouter')


const app = express();

app.set('view engine', 'twig');
app.set('views', './views');

app.use('/assets/employeespics', express.static('./public/assets/employeespics'));
app.use(express.static('./'));
// app.use(express.static('./public'))
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: '123456789',
    resave: true,
    saveUninitialized: true,
}))
app.use(mainRouter);
app.use(companyRouter);
app.use(employeeRouter);



app.listen(4000, (err) =>{
    if (err){
        console.log(err)
    }else{
        console.log("Connecté au port 4000")
    }
})

mongoose.connect('mongodb://localhost:27017/RH')