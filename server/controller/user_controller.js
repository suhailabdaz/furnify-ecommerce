const otpgenerator=require("otp-generator")
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');
const usersModel=require("../model/user_model")
const userotp = require('../model/user_otp_model')

const {nameValid,
    emailValid,
    phoneValid,
    passwordValid,
    confirmpasswordValid}=require("../../utils/validators/signup_Validators")
const { Email, pass } = require('../../env');
const otpModel = require("../model/user_otp_model");
console.log(Email,pass)




const home=async(req,res)=>{
    res.render("users/index")
}

const shop=async(req,res)=>{
    res.render("users/shop")
}

const profile=async(req,res)=>{
    res.render("users/login")
}

const signup=async(req,res)=>{
    res.render("users/signup")
}
const sendmail = async (email, otp) => {
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: Email,
                pass: pass
            }
        });

        var mailOptions = {
            from: 'Furnify <thefurnify@gmail.com>',
            to: email,
            subject: 'E-Mail Verification',
            text: 'Your OTP is:' + otp
        };

        transporter.sendMail(mailOptions);
        console.log("E-mail sent sucessfully");

    }
    catch (err) {
        console.log("error in sending mail:", err);
    }
}

const generateotp=()=>{
    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false,digits:true });
console.log('Generated OTP:', otp);
return otp;
}

const signupotp = async (req, res) => {
    try {
        const username = req.body.username
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const cpassword = req.body.confirm_password

        const isNameValid = nameValid(username)
        const isEmailValid = emailValid(email)
        const isPhoneValid = phoneValid(phone)
        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

        const emailExist = await usersModel.findOne({ email: email })
        if (emailExist) {
            res.render('users/signup', { emailerror: "E-mail already exits" })
        }
        else if (!isEmailValid) {
            res.render('users/signup', { emailerror: "Enter a valid E-mail" })
        }
        else if (!isNameValid) {
            res.render('users/signup', { nameerror: "Enter a valid Name" })
        }
        else if (!isPhoneValid) {
            res.render('users/signup', { phoneerror: "Enter a valid Phone Number" })
        }
        else if (!ispasswordValid) {
            res.render('users/signup', { passworderror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('users/signup', { cpassworderror: "Password and Confirm password should be match" })
        }
        else {
            const hashedpassword = await bcrypt.hash(password, 10)
            const user = new usersModel({ username:username, email: email, mobileNumber: phone, password: hashedpassword })
            req.session.user = user

            const otp = generateotp()
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 30 * 1000;
            await userotp.create({ email: email, otp: otp, expiry: new Date(expiryTimestamp) })

            await sendmail(email, otp)
            res.redirect('/otp')
        }
    }
    catch (err) {
        console.error('Error:', err);
        res.send('error')
    }
}

const otp = async (req, res) => {
    try {
        res.render('users/otp')
    }
    catch {
        res.status(200).send('error occured')

    }

}

const verifyotp = async (req, res) => {
    try {
        const enteredotp = req.body.otp

        const user = req.session.user
       
        console.log(enteredotp);

        console.log(req.session.user);
        const email = req.session.user.email
        const userdb = await otpModel.findOne({ email: email })
        const otp = userdb.otp
        const expiry = userdb.expiry
        console.log(otp);
        if (enteredotp == otp && expiry.getTime() >= Date.now()) {


            try {
                // if(req.session.signup)
                await usersModel.create(user)
                res.redirect('/')
                
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error occurred while saving user data');
            }
        }
        else {
            res.status(400).send("Wrong OTP or Time Expired");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send('error occured')

    }
}

const resendotp=async(req,res)=>{
    try{
    const email = req.session.user.email
    const otp = generateotp()
     console.log(otp);

     const currentTimestamp = Date.now();
     const expiryTimestamp = currentTimestamp + 60 * 1000;
     await otpModel.updateOne({ email: email },{otp:otp,expiry:new Date(expiryTimestamp)})

     await sendmail(email, otp)

    }
    catch(err){
       console.log(err);
    }

}

const loginaction=async(req,res)=> {
    try{
        const email=req.body.email
        const user=await usersModel.findOne({email:email})
        const passwordmatch=await bcrypt.compare(req.body.password,user.password)
        if(passwordmatch){
            req.session.isAuth = true;
            res.redirect('/');
        }
        else{
            // req.flash('passworderror','invalid password')
            // res.redirect('/login')
            res.render("users/login.ejs",{passworderror:"Invalid-password"} )
        }
    }
    catch{
        // req.flash('emailerror','invalid e-mail')
        // res.redirect('/login')
        res.render("users/login.ejs",{emailerror:"Invalid-email"})
    }
}

const forgotpassword=async (req, res) => {
    try {
        res.render('users/forgotpass.ejs')
    }
    catch {
        res.status(200).send('error occured')

    }
}

const forgotpasspost=async (req, res) => {
    try {
        const email=req.body.email
        const emailexist= await usersModel.findOne({email:email})
        req.session.id=emailexist._id
        console.log(emailexist);
        if(emailexist){
            req.session.forgot=true
            req.session.signup=false
            req.session.user = { email: email };
            const otp = otpgenerator()
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 60 * 1000;
            await otpModel.create({ email: email, otp: otp, expiry: new Date(expiryTimestamp) })

            await sendmail(email, otp)
            res.redirect('/otp')
        }
        else{
           res.render('users/forgotpass.ejs',{email:"E-Mail Not Exist"})
        }
    }
    catch(err) {
        res.status(400).send('error occurred: ' + err.message);
        console.log(err);

    }
}

const newpassword = async (req, res) => {
    try {
        res.render('users/newpassword.ejs')
    }
    catch {
        res.status(400).send('error occured')

    }
}

const resetpassword = async (req, res) => {
    try {
        const password = req.body.newPassword
        const cpassword = req.body.confirmPassword

        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

         if (!ispasswordValid) {
            res.render('user/newpaasword', { perror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('user/newpassword', { cperror: "Password and Confirm password should be match" })
        }
        else{
            const hashedpassword = await bcrypt.hash(password, 10)
            const email = req.session.user.email;
            await usersModel.updateOne({email:email},{password:hashedpassword})
            res.redirect('/login')

        }
    }
    catch {
        res.status(400).send('error occured')

    }
}



module.exports={home,shop,profile,signup,generateotp,signupotp,otp,verifyotp,loginaction,resendotp,forgotpassword}