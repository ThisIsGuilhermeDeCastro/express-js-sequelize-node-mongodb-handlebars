//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash')
    require("./models/Post")
    const Post = mongoose.model("posts")
    require("./models/Category")
    const Category = mongoose.model("categories")
    const user = require("./routes/user")
    const passport = require('passport')
    require("./config/auth")(passport)

//Configs
    //Session
        app.use(session({
            secret: "anything",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())

    //Middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })

    //BodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //HandleBars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main', runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }}))
        app.set('view engine', 'handlebars')

    //Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://127.0.0.1:27017/blog").then(()=>{
            console.log("Database connection successfull.")
        }).catch((error)=>{
            console.log("Database connection error."+error)
        })

    //Public (bootstrap)
        app.use(express.static(path.join(__dirname,"public")))


//Routes

    app.get('/', (req, res)=>{
        Post.find().populate("category").sort({date: -1}).then((posts)=>{
            res.render("index", {posts: posts})
        }).catch((err)=>{
            req.flash("error_msg", "Error to list posts.")
            res.redirect("/404")
        })
    })


    app.get("/404", (req, res)=>{
        res.send("Erro 404!")
    })


    app.use('/admin', admin)

    app.get("/post/:slug", (req, res)=>{
        Post.findOne({slug: req.params.slug}).then((post)=>{
            if(post){
                res.render("post/index", {post: post})
            } else{
                req.flash("error_msg", "Error to acess posts page.")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "There was error.")
            res.redirect("/")
        })
    })
    

    app.get("/categories", (req, res)=>{
        Category.find().sort({date: -1}).then((categories)=>{
            res.render("categories/index", {categories: categories})
        }).catch((err)=>{
            req.flash("error_msg", "Error to list categories.")
            req.redirect("/")
        })
    })
    

    app.get("/categories/:slug", (req, res)=>{
        Category.findOne({slug: req.params.slug}).then((category)=>{    
            if(category){
                Post.find({category: category._id}).sort({date: -1}).then((posts)=>{
                    res.render("categories/posts", {posts: posts, category: category})
                }).catch((err)=>{
                    req.flash("error_msg", "Error to list posts.")
                    res.redirect("/categories")
                })
            } else{
                req.flash("error_msg", "This is category not exist.")
                res.redirect("/categories")
            }

        }).catch((err)=>{
            req.flash("error_msg", "Error to list categories.")
            res.redirect("/categories")
        })
    })

    app.use("/users", user)



//Others

    const PORT = 8082
    app.listen(PORT,()=>{
        console.log('Successfully initialized server.')
    })
