//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true });

const itemsSchema = {
  name: String,
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'First item',
});

const item2 = new Item({
  name: '2nd item',
});

const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully saved default items to DB.');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: 'To do List', newListItems: foundItems });
    }
  });
});

app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        // Show existing list
        res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });
});

app.post('/', function (req, res) {
  let itemName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === 'To do List') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'To do List') {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log('Successfully deleted checked item.');
        res.redirect('/');
      }
    });
  } else {
    // List.findOneAndUpdate({}, {}, callback)
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        res.redirect('/' + listName);
      }
    );
  }
});

// app.get('/work', function (req, res) {
//   res.render('list', { listTitle: 'Work List', newListItems: workItems });
// });

// app.post('/work', function (req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect('/work');
// });

app.listen(3000, function () {
  console.log('server started on port 3000');
});
