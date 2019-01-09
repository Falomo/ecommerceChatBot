var passport = require('passport');
var User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({ min: 4 });

    var errors = req.validationErrors();
    if(errors){
        let messages = [];
        errors.forEach((error) => {
            messages.push(error.msg)
        });
        return done(null, false, req.flash('error', messages))
    }

    console.log('we are here bruv')
    User.findOne({ email }, (err, user) => {
        if(err)
            return done(err);
        if(user)
            return done(null, false, {message:'Email is already taken'});
        let newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, user) => {
            if(err)
                return done(err);
            return done(null, newUser);
        });
        
    })
}))
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        let messages = [];
        errors.forEach((error) => {
            messages.push(error.msg)
        });
        return done(null, false, req.flash('error', messages))
    }

    console.log('we are here bruv')
    User.findOne({ email }, (err, user) => {
        if(err)
            return done(err);
        if(!user)
            return done(null, false, {message:'User not Found'});
        if(!user.validPassword(password))
            return done(null, false, { message: 'Password is invalid' })
        done(null, user);
        
    })
}))