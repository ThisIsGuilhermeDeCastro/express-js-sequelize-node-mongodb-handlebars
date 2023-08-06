const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/User")
const User = mongoose.model("users")
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get("/register", (req,res)=>{
    res.render("users/register")
})

router.post("/register/new", (req, res)=>{
    
    var err = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        err.push({text: "Invalid name"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        err.push({text: "Invalid email"})
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        err.push({text: "Invalid password"})
    }
    if(req.body.password.length < 4){
        err.push({text: "Small password"})
    }
    if(req.body.password != req.body.passwordconfirm){
        err.push({text: "Diferents passwords"})
    }

    if(err.length > 0){
        res.render("users/register", {err: err})
    } else{
        User.findOne({email: req.body.email}).then((user)=>{
            if(user){
                req.flash("error_msg", "Already exist one account whith email.")
                res.redirect("/")
            }else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    //isAdm: true
                })
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err){
                            req.flash("error_msg", "There was a internal error: 001")
                            res.redirect("/")
                        }

                        newUser.password = hash

                        newUser.save().then(()=>{
                            req.flash("success_msg", "User registered whith success.")
                            res.redirect("/")
                        }).catch((err)=>{
                            req.flash("error_msg", "There was a internal error: 002")
                            res.redirect("/")
                        })
                    })
                })
            }
        }).catch((err)=>{
            req.flash("error_msg", "Error to registered new user.")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res)=>{
    res.render("users/login")
})

router.post("/login/validate", (req, res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err){
            req.flash("error_msg", "Error to logout.")
            res.redirect("/")
        }
        req.flash("success_msg", "Logout with succefully!")
        res.redirect("/")
    })
})

module.exports = router