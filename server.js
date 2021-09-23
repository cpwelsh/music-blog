const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const app = express()
const Handlebars = require('handlebars')
const fs = require('fs')

app.use('/public', express.static('public'))



app.use(require('cookie-parser')());

app.use(require('body-parser').urlencoded({ extended: true }));

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());

//Configure auth
const userMap = { su: 'su' }
const comments = []

passport.use(new LocalStrategy(
    function (username, password, done) {
        if (userMap[username] === password) {
            return done(null, { name: 'Mike', id: username })
        } else {
            return done("User does not exist")
        }
    }
));

app.use(passport.session());

//Serialize the user
passport.serializeUser(function (user, done) {
    console.log('Serializing')
    done(null, user.id);
});

//Deserialize the user
passport.deserializeUser(function (id, done) {
    console.log('Deserializing')

    if (userMap[id]) {

        done(null, { id: id })

    } else {

        done(new Error("Not found"), null)

    }
});


app.listen(3001, () => {
    console.log('app listening')
})

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    }
);

app.post('/add-comment', (req, res) => {
    const comment = req.body.commentText

    if (comment) {
        comments.push(comment)
    }

    //redirect the user back home
    res.redirect('/')

})

app.post('/delete-comment', (req, res) => {
    let index = req.body.index

    try {
        index = Number.parseInt(index)

        if (index >= 0) {
            comments.splice(index, 1)
            console.log('index >= 0')
        }
    } catch (error) {
        console.log(error)
    }


    //redirect the user back home
    res.redirect('/')

})

app.get ('/logout', function (req, res) {
    console.log('Get for /logout') 

        res.redirect ('/login')

        req.session.destroy()

})

app.get ('/about', function (req, res) {
    console.log('Get for /about') 

    const aboutPage = fs.readFileSync('./views/about.handlebars.html').toString()

    const template = Handlebars.compile(aboutPage)
        res.header('Context-Type', 'text/html')
        res.send(template({ }))
})

app.get('/', function (req, res) {

    console.log('Get for /')

    //req.session.destroy()

    if (req.user) {
        console.log('request is authenticated!')
        //TODO: Send them to the music blog page...
        const musicPage = fs.readFileSync('./views/main.handlebars').toString()

        const template = Handlebars.compile(musicPage)
        res.header('Context-Type', 'text/html')
        res.send(template({ comments: comments, user: req.user }))

    } else {
        res.redirect('/signup')
    }
})

//signup functionality

app.post('/signup', (req, res) => {
    if (req.user) {
        res.redirect('/')
    } else {
        const username = req.body.username

        const password = req.body.password

        if (username && password) {
            userMap[username] = password
        }

        //redirect the user back home
        res.redirect('/login')
    }
})

app.get('/signup', function (req, res) {

    //req.session.destroy()

    if (! req.user) {
        console.log('request is authenticated!')
        //TODO: Send them to the music blog page...
        const signupPage = fs.readFileSync('./views/signup.handlebars').toString()

        const template = Handlebars.compile(signupPage)
        res.header('Context-Type', 'text/html')
        res.send(template())

    } else {
        res.redirect('/')
    }
})


app.get('/login', function (req, res) {
    //Use path.resolve
    if (! req.user) {
        res.sendFile(__dirname + '/views/login.handlebars.html')
    } else {
        res.redirect('/')
    }
})
