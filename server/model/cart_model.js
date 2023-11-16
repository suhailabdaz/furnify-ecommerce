const mongoose=require('mongoose')
const Schema = mongoose.Schema;

mongoose.connect("mongodb://127.0.0.1:27017/furnify")


const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userdetails',
  },
  sessionId: String,
  item: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      
      //   stock:{
      //     type:String,
      //     required:true,
      // },

      price: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  total: Number,
});

const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel;
