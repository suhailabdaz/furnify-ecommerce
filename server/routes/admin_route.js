const express=require('express')
const admin_controller=require('../controller/admin_controller')
const product_controller=require("../controller/product_controller")

const multer=require('multer')
const upload=multer({dest:'uploads/'})


const app=express();


app.use(express.static('public/admin_assets'))

const adrouter=express.Router()
adrouter.use(express.urlencoded({extended:true}))

adrouter.get('/',admin_controller.login)
adrouter.post('/adminlogin',admin_controller.adminloginpost)
adrouter.get('/adminpanel',admin_controller.adminpanel)
adrouter.get('/userslist',admin_controller.userslist)
adrouter.get('/update/:email',admin_controller.userupdate)
adrouter.post('/searchUser',admin_controller.searchUser)
adrouter.get('/searchview',admin_controller.searchview)
adrouter.get('/filter/:option',admin_controller.filter)

adrouter.get('/category',admin_controller.category)
adrouter.get('/newcat',admin_controller.newcat)
adrouter.post('/add-category',admin_controller.addcategory)
adrouter.get('/unlistcat/:id',admin_controller.unlistcat)
adrouter.get('/updatecat/:id',admin_controller.updatecat)
adrouter.post('/update-category/:id',admin_controller.updatecategory)

adrouter.get('/product',product_controller.products)
adrouter.get('/newproduct',product_controller.newproduct)
adrouter.post('/addproduct',upload.array('images'),product_controller.addproduct)
adrouter.get('/unlist/:id',product_controller.unlist)
adrouter.get('/deletepro/:id',product_controller.deletepro)
adrouter.get('/updatepro/:id',product_controller.updatepro)
adrouter.get('/editimg/:id',product_controller.editimg)
adrouter.get('/deleteimg',product_controller.deleteimg)
adrouter.post('/updateimg/:id',upload.array('images'),product_controller.updateimg)
adrouter.post('/updateproduct/:id',product_controller.updateproduct)










module.exports= adrouter