const categoryModel=require('../model/category_model')




const userdetails = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.render("users/userdetails",{categories})
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

module.exports={userdetails}