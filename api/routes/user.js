const express = require('express');
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const User = require('../models/user');


router.post('/signup' ,  (req,res,next) =>{
    /* bcrypt.hash(req.body.password, 10 , (err ,hash) =>{
        if(err) {
            return res.status(500).json({
                error : err
            }) 
        }else{ */
            //console.log('hit')
            User.find({ email : req.body.email})
            .exec()
            .then( user => {
                if(user.length >=1 ){
                    console.log(user.length+'_________')
                    return res.status(409).json({
                        message : 'Mail already exist'
                    });
                }else{
                      
                    const user = new User({
                        _id : new mongoose.Types.ObjectId(),
                        email : req.body.email,
                        //password : hash,
                        password : req.body.password
                    });   
                    user
                    .save()
                    .then(result => {
                        console.log(result)
                        res.status(201).json({
                        message : 'User added'      
                        })
                    })
                    .catch( err => {
                        res.status(500).json({
                            error : err
                        })
                    })
                        }
            })
            
       // }
   // })
    
})

router.post('/login' , (req,res,next) => {
    User.find( { email : req.body.email})
    .exec()
    .then( user => {
        console.log(user[0].email)
         if(user.length < 1){
             return res.status(401).json({
                 message : 'Auth Failed'
             });
         }
         if(user[0].password === req.body.password){

           const token =   jwt.sign(
            {
                email : user[0].email,
                userId : user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn : "1h"
            }
            );
            return res.status(200).json({
                message : 'Auth Success',
                token : token
            });
         }else{
            return res.status(401).json({
                message : 'Auth Failed'
            });
         }
    })
    .catch( err => {
        res.status(500).json({
            error : err
        })
    })

})

router.delete('/:user_id' , (req,res,next) => {
    User.remove({ _id : req.params.user_id})
    .exec()
    .then( result => {
        res.status(201).json({
            message : 'user deleted'
        })
    })
    .catch( err => {
        res.status(500).json({
            error : err
        })
    })

})

module.exports = router;