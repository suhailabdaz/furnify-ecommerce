const otpgenerator=require("otp-generator")
const bcrypt=require("bcrypt")
const nodemailer = require('nodemailer');
const usersModel=require("../model/user_model")
const userotp = require('../model/user_otp_model')
const categoryModel=require('../model/category_model')
const productModel=require('../model/product_model')

const {nameValid,
    emailValid,
    phoneValid,
    passwordValid,
    confirmpasswordValid}=require("../../utils/validators/signup_Validators")
const { Email, pass } = require('../../env');
const otpModel = require("../model/user_otp_model");
console.log(Email,pass)




const home = async (req, res) => {
    try {
        // Assuming your categoryModel has a method like getAllCategories
        const categories = await categoryModel.find();

        res.render("users/index", { categories });
    } catch (error) {
        // Handle error appropriately, e.g., log it or send an error response
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
    }
};
const shop = async (req, res) => {
    const category = req.query.category;
  
    // Fetch products based on the selected category
    const products = await productModel.find({$and:[{category},{status:true}] }).exec();
    const categories = await categoryModel.find();
    const ctCategory = categories.find(cat => cat._id.toString() === category);

  // Extract the name of the selected category
  const categoryName =ctCategory ? ctCategory.name : null;

 

    
    // Render the shop page with the filtered products
    res.render("users/shop", { categoryName,categories,products, selectedCategory: category });
  };
  
  const singleproduct=async(req,res)=>{
    try{
        const id=req.params.id
        const product=await productModel.findOne({_id:id}) 
        const categories = await categoryModel.find();
        product.images = product.images.map(image => image.replace(/\\/g, '/'));
        console.log('Image Path:', product.images[0]);
        res.render('users/singleproduct',{categories,product:product})
            
    }
    catch(err){
        console.log("Shopping Page Error:",err);
        res.status(500).send('Internal Server Error');
    }

}

const profile=async(req,res)=>{
    try {
        if(req.session.isAuth){
            const categories = await categoryModel.find();
            const name=req.session.username
            res.render("users/profile", { categories,name});
            

        }
        else{
            res.render("users/login");
        }


    } catch (error) {
        // Handle error appropriately, e.g., log it or send an error response
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
    }
}

const logout= async(req, res) => {
    try {
        req.session.userId=null
        req.session.isAuth=false
        req.session.destroy()
        res.redirect("/")

        }
    catch (error) {
        // Handle error appropriately, e.g., log it or send an error response
        console.error("Error fetching categories:", error);
        res.status(500).send("Internal Server Error");
    }
};

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
            req.session.signup = true
            req.session.forgot = false

            const otp = generateotp()
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 30 * 1000;
            const filter = { email: email };
            const update = {
            $set: {
            email: email,
            otp: otp,
            expiry: new Date(expiryTimestamp),
            }
            };

const options = { upsert: true };

await otpModel.updateOne(filter, update, options);

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

            user.isVerified = true;
            try {
                if(req.session.signup){
                await usersModel.create(user)
                res.redirect('/')
                }
                else if(req.session.forgot){
                    res.redirect('/newpassword')
                }
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

const loginaction = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await usersModel.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            throw new Error('User not found');
        }

        const passwordmatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordmatch && !user.status) {
            // Authentication successful
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.isAuth = true;
            res.redirect('/');
        } else {
            // Authentication failed
            res.render("users/login.ejs", { passworderror: "Invalid password or you're BLOCKED" });
        }
    } catch (error) {
        // Error occurred, could be due to user not found or other issues
        res.render("users/login.ejs", { emailerror: "Invalid email" });
    }
};

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
        // req.session.id=emailexist._id
        console.log(emailexist);
        if(emailexist){
            req.session.forgot=true
            req.session.signup=false
            req.session.user = { email: email };
            const otp = generateotp()
            console.log(otp);
            const currentTimestamp = Date.now();
            const expiryTimestamp = currentTimestamp + 60 * 1000;
            const filter = { email: email };
            const update = {
              $set: {
                email: email,
                otp: otp,
                expiry: new Date(expiryTimestamp),
              }
            };
            
            const options = { upsert: true };
            
            await otpModel.updateOne(filter, update, options);
            

            await sendmail(email, otp)
            res.redirect('/otp')
        }
        else{
           res.render('users/forgotpass.ejs',{emaile:"E-Mail Not Exist"})
        }
    }
    catch(err) {
        res.status(400).send('error occurred: ' + err.message);
        console.log(err);

    }
}



const new_password = async (req, res) => {
    try {
        res.render('users/newpassword.ejs')
    }
    catch {
        res.status(400).send('error occured')

    }
}

const reset_password = async (req, res) => {
    try {
        const password = req.body.newPassword
        const cpassword = req.body.confirmPassword

        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

         if (!ispasswordValid) {
            res.render('users/newpassword', { perror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('users/newpassword', { cperror: "Password and Confirm password should be match" })
        }
        else{
            const hashedpassword = await bcrypt.hash(password, 10)
            const email = req.session.user.email;
            await usersModel.updateOne({email:email},{password:hashedpassword})
            res.redirect('/profile')

        }
    }
    catch {
        res.status(400).send('error occured')

    }
}



module.exports={home,shop,profile,signup,generateotp,signupotp,otp,verifyotp,loginaction,resendotp,forgotpassword
,forgotpasspost,new_password,reset_password,singleproduct,logout}