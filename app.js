const express=require("express")
const session=require('express-session')
const mongoose = require("mongoose")
const usrouter=require("./server/routes/user_route")
const path=require("path")
const ejs=require("ejs")
const nocache=require("nocache")

const app=express()
const port=3000
app.use(nocache())
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
}));

// app.use(flash());
app.use(express.urlencoded({extended:true}))

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/usersassets'));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs")




app.use("/",usrouter)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });