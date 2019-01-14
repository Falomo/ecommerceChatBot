var passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const knex = require('../configs/knex-config');
const bcrypt = require('bcrypt-nodejs');

passport.serializeUser((user, done) => {

    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log('deserialize', id)
    knex.select('*').from('users').where({id}).then( (data, err) => {
        
        done(err, data[0]);
    })
    
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

    console.log(email)
    knex.select('*').from('users').where({email})
        .then((user, err) => {
            
            if(err)
                return done(err);
            if(user[0])
                return done(null, false, {message:'Email is already taken'});
            let newUser = {};
            newUser.email = email;
            newUser.password = encryptPassword(password);

            knex('users').insert(newUser).then((user, err) => {
               newUser.id = user[0];

                if(err)
                    return done(err);
                return done(null, newUser);
            });
            
        });
    console.log('we are here bruv')
    
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

    knex.select('*').from('users').where({email})
        .then( (user, err) => {
            let checkPass = user[0].password;

            if(err)
                return done(err);
            if(!user)
                return done(null, false, {message:'User not Found'});
            if(!(validPassword(password, checkPass)))
                return done(null, false, { message: 'Password is invalid' })

            let newUser= {
                id : user[0]['ID']
            }
            done(null, newUser);

    })
}))



//ENCRYPTION FUNCTIONS
function encryptPassword(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}

function validPassword(password, checkPass){
    return bcrypt.compareSync(password, checkPass);
}