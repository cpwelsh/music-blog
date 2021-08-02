const path = require('path');
const express = require('express');
const sequelize = require('sequelize');
const passport = require('passport');
const Handlebars = require('handlebars');
LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
require('dotenv').config
const userMap = {}
const app = express() 
app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
passport.use(new LocalStrategy(
    
    function(username, password, done) {
        console.log(username, password)
        if (userMap[username] === password) {
            return done(null, {username})
        } else {
            return done(null, false)
        }
    }
  ));
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
   
  passport.deserializeUser(function(id, done) {
      return {username: userMap [id]}
  });

  app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.use(passport.initialize());
app.use(passport.session());
app.get('/login', function(req, res){
    const source = fs.readFileSync('./views/login.handlebars').toString()
    var template = Handlebars.compile(source)
    res.send(template({}))
})
app.listen(3001, function(){
    console.log('server is listening')
})




