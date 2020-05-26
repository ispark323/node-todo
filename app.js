const express = require('express');
const bodyParser = require('body-parser');

let items = ['Task1', 'Task2'];
let workItems = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('list', { listTitle: 'To do List', newListItems: items });
});

app.post('/', function (req, res) {
  let item = req.body.newItem;

  if (req.body.list === 'Work') {
    workItems.push(item);
    res.redirect('/work');
  } else {
    items.push(item);
    res.redirect('/');
  }
});

app.get('/work', function (req, res) {
  res.render('list', { listTitle: 'Work List', newListItems: workItems });
});

app.post('/work', function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect('/work');
});

app.listen(3000, function () {
  console.log('server started on port 3000');
});
