const express = require("express");
const app = express();
const port = 3000;
const { create } = require('express-handlebars');
const hbs = create({
  extname: 'hbs', 
  defaultLayout: 'main', 
  partialsDir: 'views/partials',
  // helpers: require('./utils/helpers')
});
const session = require('express-session'); 
const passport = require('passport'); 
const morgan = require('morgan'); 
const flash = require('connect-flash');
const methodOverride = require('method-override')

app.use(morgan('dev')); 
app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.static('public')); 
app.use(flash()); 
app.use(methodOverride('_method'))

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

require('./config/passport'); 

app.use("/", require("./routes"));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});