const db = require("../models");
const Store = db.store;

exports.createStore = (req, res) => {
  Store.create({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    ownerId: req.userId
  })
    .then(store => {
      res.send({ message: "Store was created successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
