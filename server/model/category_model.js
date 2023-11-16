const mongoose=require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/furnify")

const catschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:true,
        default:true

    }
    
})


const categoryModel=new mongoose.model("categories",catschema)

module.exports=categoryModel