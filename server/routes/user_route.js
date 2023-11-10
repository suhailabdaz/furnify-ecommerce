const express=require("express")
const usrouter=express.Router()
const user_controller=require("../controller/user_controller")

usrouter.get("/",user_controller.home)

usrouter.get("/shop",user_controller.shop)

usrouter.get("/profile",user_controller.profile)

usrouter.get("/signup",user_controller.signup)

usrouter.post("/signupotp",user_controller.signupotp)

usrouter.get('/otp',user_controller.otp)

usrouter.post("/verifyotp",user_controller.verifyotp)

usrouter.post("/resendotp",user_controller.resendotp)

usrouter.post("/loginaction",user_controller.loginaction)

usrouter.get("/forgotpassword",user_controller.forgotpassword)












module.exports=usrouter