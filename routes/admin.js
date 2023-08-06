const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Category")
const Category = mongoose.model('categories')
require("../models/Post")
const Post = mongoose.model("posts")
const {isAdm} = require("../helpers/isAdm")
require("../models/User")
const User = mongoose.model('users')



//Admin Panel

router.get('/', isAdm, (req, res) => {
    res.render("admin/index")
})


//Users

router.get("/users", isAdm, (req, res)=>{
    User.find().then((users)=>{
        res.render("admin/users", {users: users})
    }).catch((err)=>{
        req.flash("error_msg", "Error to find users.")
        res.redirect("/admin")
    })
})

router.get("/users/delete/:id", isAdm, (req, res)=>{
    User.deleteOne({_id: req.params.id}).then((id)=>{
        req.flash("success_msg", "Account deleted whith success!")
        res.redirect("/admin/users")

    }).catch((err)=>{
        req.flash("error_msg", "Error to delete account.")
        res.redirect("/admin/users")
    })
})

router.get("/users/edit/:id", isAdm, (req, res)=>{
    User.findOne({_id: req.params.id}).then((user)=>{
        res.render("admin/edituser", {user: user})
    }).catch((err)=>{
        req.flash("error_msg", "Error to find user.")
        res.redirect("/admin/users")
    })
})

router.post("/users/edit/new", isAdm, (req, res)=>{
    User.findById(req.body.id).then((user)=>{
        user.name = req.body.name
        user.isAdm = req.body.isAdm
        user.save().then(()=>{
            req.flash("success_msg", "Save user with success!")
            res.redirect("/admin/users")
        }).catch((err)=>{
            req.flash("error_msg", "Error to edit user.")
            res.redirect("/admin/users/edit")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Error to find user.")
        res.redirect("/admin/users")
    })
})


//Post

router.get("/posts", isAdm, (req,res)=>{
    Post.find().populate("category").sort({date: -1}).then((posts)=>{
        res.render("admin/posts", {posts: posts})
    }).catch((err)=>{
        req.flash("error_msg", "Error to list posts.")
        res.render("admin/posts")
    })
})

router.get("/posts/add", isAdm, (req, res)=>{
    Category.find().then((categories)=>{
        res.render("admin/addposts", {categories: categories})
    }).catch((err)=>{
        req.flash("error_msg", "Error to send categories to form.")
        res.redirect("/admin/posts")
    })
})

router.post("/posts/new", isAdm, (req, res)=>{

    var err = []

    if(req.body.category == "0"){
        err.push({text: "Invalid category, register a new category."})
    }
    if(err.length>0){
        res.render("admin/posts/add", {err: err})
    } else{
        
        const newPost = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category,
        }

        new Post(newPost).save().then(()=>{
            req.flash("success_msg", "Post add successfuly!")
            res.redirect("/admin/posts")
        }).catch((err)=>{
            req.flash("error_msg", "Error to add post.")
            res.redirect("/admin/posts")
        })
    }
})

router.get("/posts/edit/:id", isAdm, (req,res)=>{
    Post.findOne({_id: req.params.id}).then((post)=>{
        Category.find().then((categories)=>{
            res.render("admin/editposts", {categories: categories, post: post})
        }).catch((err)=>{
            req.flash("error_msg", "Error to list categories.")
            res.redirect("/admin/posts")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Error to search params.")
        res.redirect("/admin/posts")
    })
})

router.post("/posts/edit/new", isAdm, (req, res)=>{

    Post.findOne({_id: req.body.id}).then((post)=>{

        post.title = req.body.title
        post.slug = req.body.slug
        post.description = req.body.description
        post.content = req.body.content
        post.category = req.body.category

        post.save().then(()=>{
            req.flash("success_msg", "Post atualize successfuly!")
            res.redirect("/admin/posts")
        }).catch((err)=>{
            req.flash("error_msg", "Error to save post.")
            res.redirect("/admin/posts")
        })
        
    }).catch((err)=>{
        req.flash("error_msg", "Error to save post.")
        res.redirect("/admin/posts")
    })
})

router.get("/posts/delete/:id", isAdm, (req, res)=>{
    Post.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Post delete successfully!")
        res.redirect("/admin/posts")
    }).catch((err)=>{
        req.flash("error_msg", "Error to delete post.")
    })
})


//Categories

router.get('/', isAdm, (req, res)=> {
    res.send("Admin home page.")
})

router.get('/posts', isAdm, (req, res)=>{
    res.send("Posts page")
})

router.get("/categories", isAdm, (req, res)=> {
    Category.find().sort({date: -1}).then((categories)=>{
        res.render('admin/categories', {categories: categories})
    }).catch((err)=>{
        req.flash("error_msg","Error to listing categories.")
        res.redirect("/admin")
    })
})

router.post("/categories/new", isAdm, (req, res)=> {
    
    const newCategory = {
        name: req.body.name,
        slug: req.body.slug
    }

    if(newCategory.name.trim() !== '' && newCategory.slug.trim() !== ''){
        new Category(newCategory).save().then(()=>{
            req.flash("success_msg", "Category created successuffly.")
            res.redirect("/admin/categories")
        }).catch((error)=>{
            req.flash("error_msg", "Error create category, try again!")
            res.redirect('/admin')
        }) 
    } else{
        var err = []
        err.push({text: "Fill in the blank fields."})
        req.flash("error_msg", "Fill in the blank fields.")
        res.redirect("/admin/categories/add")
    }

    //Mostrar lista de erros:

    /*var error = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        error.push({text: "Invalid name"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        error.push({text: "Invalid slug"})
    }

    if(error.length > 0){
        res.render("admin/addcategories", {error: error})
    }*/

})

router.get("/categories/add", isAdm, (req, res) =>{
    res.render('admin/addcategories')
})

router.get("/categories/edit/:id", isAdm, (req, res) => {
    Category.findOne({_id:req.params.id}).then((category)=>{
        res.render('admin/editcategories', {category: category})
    }).catch((err)=>{
        req.flash("error_msg", "This is category not exist")
        res.redirect("/admin/categories")
    })
})

router.post("/categories/edit", isAdm, (req,res)=>{
    Category.findOne({_id: req.body.id}).then((category)=>{
        category.name = req.body.name
        category.slug = req.body.slug

        category.save().then(()=>{
            req.flash("success_msg", "Category save succefuly!")
            res.redirect("/admin/categories")
        }).catch((err)=>{
            req.flash("error_msg", "Error to save category.")
            res.redirect("/admin/categories")
        })

        
    }).catch((err)=>{
        req.flash("error_msg", "Error to edit category.")
        res.redirect("/admin/categories")
    })
})

router.post("/categories/delete", isAdm, (req,res)=>{
    Category.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Category deleted successfuly!")
        res.redirect("/admin/categories")
    }).catch((err)=>{
        req.flash("error_msg", "Error to delete category.")
        res.redirect("/admin/categories")
    })
})

module.exports = router