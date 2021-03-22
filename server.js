if (process.env.NODE_ENV !== 'production') require('dotenv-safe').config();
const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');

const db = require('./models');
const routes = require('./routes');

const Handlebars = require('handlebars');
const { library, dom, icon } = require('@fortawesome/fontawesome-svg-core');
const fas = require('@fortawesome/free-solid-svg-icons').fas;
const fab = require('@fortawesome/free-brands-svg-icons').fab;

library.add(fas);
library.add(fab);

Handlebars.registerHelper('fontawesome-css', function () {
  return new Handlebars.SafeString(dom.css());
});
Handlebars.registerHelper('fontawesome-icon', function (args) {
  return new Handlebars.SafeString(
    icon({ prefix: 'fas', iconName: args.hash.icon }).html
  );
});

const app = express();

app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
  })
);
app.set('view engine', 'hbs');

app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'bootstrap'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true,
  })
);
app.use(express.static('public'));
app.use(
  '/bootstrap',
  express.static(path.join(__dirname + '/node_modules/bootstrap/dist'))
);

app.use(morgan('combined'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use('/', routes);

const PORT = process.env.PORT || 8000;

db.sequelize
  .sync({ force: true })
  .then(() => {
    app.listen(PORT, console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log('Error: ' + err));

module.exports = app;
