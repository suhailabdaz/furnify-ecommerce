
const mongoose=require("mongoose")
const bcyrpt= require('bcrypt')

mongoose.connect("mongodb://127.0.0.1:27017/furnify")
.then(console.log("done"))
.catch((err)=>console.log(err));



const usersSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String,required:true }, 
    password: { type: String, required: true },
    isAdmin:{
        type:Boolean,
        default:false,
        required:true
    },
    status:{
        type:Boolean,
        default:false,
        required:true
    }


})

const usersModel=new mongoose.model("userdetails",usersSchema)

module.exports=usersModel