const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.orders_get_all =  (req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
        console.log(docs)
    res.status(200).json({
    count : docs.length,
    orders : docs.map ( doc => {
        return {
            _id : doc._id,
            product : doc.product,
            quantity : doc.quantity,
            request : {
                type : 'GET',
                url : 'http://localhost:3000/orders/'+doc._id
          }

        }      
    })
   }) 
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    })

};

exports.orders_create = (req,res,next)=>{
  
    Product.findById(req.body.productId)
    .then( product =>{
        if(!product){
            return res.status(500).json({
                message : ' product not found'
            })
        }
        const order = new Order({
            _id : new mongoose.Types.ObjectId(),
            product : req.body.productId,
            quantity : req.body.quantity 
    
        });
    
       return order.save()
            
    })
    .then( result => {
        console.log(result);
        res.status(201).json({
            message : ' Order added succesfully',
            request : {
                type: 'GET',
                url : 'http://localhost:3000/orders/'+result._id
            },
            createdOrder : { id : result._id, product : result.product ,quantity : result.quantity}
        });
    }).catch((err) => { 
        console.log(err);
        res.status(500).json({error : err});
    })
    
 };