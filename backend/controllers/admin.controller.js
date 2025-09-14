const db = require("../models");
const User = db.user;
const Store = db.store;
const Rating = db.rating;
const bcrypt = require("bcryptjs");

exports.getStats = (req, res) => {
  Promise.all([
    User.count(),
    Store.count(),
    Rating.count()
  ]).then(([userCount, storeCount, ratingCount]) => {
    res.status(200).send({
      users: userCount,
      stores: storeCount,
      ratings: ratingCount
    });
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};

exports.createUser = (req, res) => {
  User.create({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    address: req.body.address,
    role: req.body.role
  })
    .then(user => {
      res.send({ message: "User was created successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUsers = (req, res) => {
  const { name, email, address, role } = req.query;
  let where = {};

  if (name) {
    where.name = { [db.Sequelize.Op.like]: `%${name}%` };
  }
  if (email) {
    where.email = { [db.Sequelize.Op.like]: `%${email}%` };
  }
  if (address) {
    where.address = { [db.Sequelize.Op.like]: `%${address}%` };
  }
  if (role) {
    where.role = role;
  }

  User.findAll({ where })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.createStore = (req, res) => {
  Store.create({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address
  })
    .then(store => {
      res.send({ message: "Store was created successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getStores = (req, res) => {
  Store.findAll({
    include: [
      {
        model: Rating,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [db.sequelize.fn('AVG', db.sequelize.col('ratings.rating')), 'averageRating']
      ]
    },
    group: ['stores.id']
  })
    .then(stores => {
      res.status(200).send(stores);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};