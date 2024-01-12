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

const morgan = require('morgan');                   // Reinicia el servidor 
const flash = require('connect-flash');             // Manda mensajes flash
const methodOverride = require('method-override')   // Usar Put y Delete en formularios


app.use(morgan('dev')); 
app.use(session({
    secret: 'tu_clave_secreta',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());                          // Para poder usar datos que se envian en el cuerpo de la solicitud (req.body)
app.use(express.urlencoded({ extended: true }));  // Para poder interpretar y analizar datos enviados desde formularios HTML

app.use(passport.initialize());
app.use(passport.session()); 

app.use(flash()); 
app.use(express.static('public')); 
app.use(methodOverride('_method'))

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

require('./config/passport'); 
require('./config/cloudinary'); 
require('./config/multer'); 

app.use("/", require("./routes"));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});