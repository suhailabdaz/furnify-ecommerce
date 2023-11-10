const mongoose=require("mongoose")
const bcyrpt= require('bcrypt')

mongoose.connect("mongodb://127.0.0.1:27017/furnify")
.then(console.log("done otp"))
.catch((err)=>console.log(err));



const otpSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiry: { type: Date,required:true }, 

})

const otpModel=new mongoose.model("otp_details",otpSchema)

module.exports=otpModel