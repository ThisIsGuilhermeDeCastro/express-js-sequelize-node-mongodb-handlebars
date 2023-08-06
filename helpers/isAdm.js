module.exports = {
    isAdm: function(req, res, next){
        //console.log(req.user.isAdm)
        if(req.isAuthenticated() && req.user.isAdm === true){
            return next();
        } else{
            req.flash("error_msg", "You neet to be adm for to enter in this page.")
            res.redirect("/")
        }
    }
}