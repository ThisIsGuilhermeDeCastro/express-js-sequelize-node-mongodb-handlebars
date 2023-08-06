const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model of user{

    require("../models/User")
    const User = mongoose.model('users')

    module.exports = function(passport){

        passport.use(new localStrategy({usernameField: 'email'}, (email, password, done)=>{
            User.findOne({email: email}).then((user)=>{
                if(!user){
                    return done(null, false, {message: "This account not exist."})
                }
                bcrypt.compare(password, user.password, (error, ok)=>{
                    if(ok){
                        return done(null, user)
                    } else{
                        return done(null, false, {message: "Incorret password."})
                    }
                })
            })
        }))

        passport.serializeUser((user, done)=>{
            done(null, user.id)
        })
        passport.deserializeUser((id, done)=>{
            User.findById(id).then((user)=>{
                done(null, user)
            })
        })
    }    
//}