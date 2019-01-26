const express = require('express');
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');

const OrderController = require('../controllers/order');


router.get('/', checkAuth ,OrderController.orders_get_all);


router.post('/', checkAuth , OrderController.orders_create)


//5c434b033dda52313881f82b

 router.get('/:order_id', checkAuth ,(req,res,next)=>{
   const id = req.params.order_id;
   Order.findById(id)
   .populate('product')
   .exec()
   .then( (doc) => {
       if(doc){
        res.status(200).json({
            order : doc,
            request : {
                type : 'GET',
                url : 'http://localhost:3000/orders'
            }
        });  
       }else{
        res.status(404).json({message : 'no valid entry found'});
       }
   })
   .catch(err => {
    console.log(err);
    res.status(500).json({error:err});
} )
   

 })

router.delete('/:order_id', checkAuth, (req,res,next)=>{
    const id = req.params.order_id;
    Order.remove({ _id : id})
    .exec()
    .then( result =>{   
        console.log(result);
        res.status(200).json({
            message : 'Order Deleted',
            request : {
                type : "POST",
                url : "http://localhost:3000/orders",
                body : { productId : "ID", quantity : "Number" }
            }
        });

    })
    .catch( err => {
        console.log(err);
        res.status(500).json({error : err});
    })
   
 })


 module.exports = router;

