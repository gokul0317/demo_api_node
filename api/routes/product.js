const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');
const multer  = require('multer');

const storage = multer.diskStorage({
destination : (req,file,cb) =>{
cb(null , './uploads/');

},
filename : (req,file,cb) => {
   var f_name =  new Date().toISOString() + file.originalname;
   var find = ':';
   var re = new RegExp(find ,'g');
   f_name = f_name.replace(re,'-')
   cb(null, f_name );
}
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null , true);
    }else{
        cb(null ,false);
    }
}
const upload = multer({storage : storage , limits : { fileSize : 1024 * 1024 * 5}, fileFilter : fileFilter });

router.get('/',(req,res,next)=>{
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
        const response = {
            count : docs.length,
            Products : docs.map( doc => {
                return {
                    name : doc.name,
                    price : doc.price,
                    _id:doc._id,
                    productImage : doc.productImage,
                    request : {
                        type : 'GET',
                        url : 'http://localhost:3000/products/'+doc._id
                    }
                }
            })
        };

        // if(docs.length > 0){
        // console.log(docs);
        res.status(200).json(response);
        // }else{
        //     res.status(404).json
        // }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    })

      
})

  router.post('/',checkAuth, upload.single('productImage'),(req,res,next)=>{
    console.log(req.file)
    const product = new Product({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        price : req.body.price,
        productImage : req.file.path
    });

    product.save().then((result) => {
        console.log(result)
        res.status(201).json({
            message : ' product added succesfully',
            createdProduct : {
                name : result.name,
                price : result.price,
                _id:result._id,
                request : {
                    type : 'GET',
                    url : 'http://localhost:3000/products/'+result._id
                }
            } 
        });

    }).catch( (err) => { 
        console.log(err);
        res.status(500).json({error : err});
    });
 
 })


 router.get('/:product_id',(req,res,next)=>{
   const id = req.params.product_id;
   Product.findById(id)
   .select('name price _id productImage')
   .exec()
   .then( doc => {
       console.log(doc);
       if(doc){
        res.status(200).json({
            Product : doc,
            request : {
                type : 'GET',
                descrption : 'GET All products',
                url : 'http://localhost:3000/products'
            }
        });    
       }else{
           res.status(404).json({message : 'no valid entry found'});
       }
       
   })
   .catch( err => {
       console.log(err);
       res.status(500).json({error:err});
   });
   
 })

 
router.patch('/:product_id', checkAuth ,(req,res,next)=>{
    const id = req.params.product_id;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id : id}, { $set : updateOps  })
    .exec()
    .then( result => {
      
        console.log(result);
        res.status(200).json({ 
           Product : result,
            request : {
                type : 'GET',
                descrption : 'GET All products',
                url : 'http://localhost:3000/products/'+id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    })
 })


 
router.delete('/:product_id', checkAuth ,(req,res,next)=>{
    const id = req.params.product_id;
    Product.remove({ _id : id})
    .exec()
    .then( result =>{
        
        console.log(result);
        res.status(200).json({
            message : 'Products Deleted',
            request : {
                type : 'POST',
                descrption : 'GET All products',
                url : 'http://localhost:3000/products',
                body: { name : 'String' , price : 'Number'}
            }
        });

    })
    .catch( err => {
        console.log(err);
        res.status(500).json({error : err});
    })
    
 })


 module.exports = router;