const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Store = db.store; // Import Store model

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  User.count().then(count => {
    let userRole = 'Normal User';
    if (count === 0) {
      userRole = 'System Administrator';
    }

    User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      address: req.body.address,
      role: req.body.role || userRole
    })
      .then(user => {
        if (user.role === "Store Owner") {
          Store.findOne({ where: { email: user.email } }).then(store => {
            if (store) {
              store.update({ ownerId: user.id }).then(() => {
                console.log("Associated user", user.id, "with store", store.id);
                res.send({ message: "User registered and linked to existing store successfully!" });
              }).catch(err => {
                res.status(500).send({ message: "Failed to link user to store: " + err.message });
              });
            } else {
              Store.create({
                name: user.name + "'s Store", // Default store name
                email: user.email,
                address: user.address || "Default Address", // Use user's address or default
                ownerId: user.id,
              })
                .then(() => {
                  res.send({ message: "User and Store registered successfully!" });
                })
                .catch(err => {
                  res.status(500).send({ message: "Failed to create store for owner: " + err.message });
                });
            }
          });
        } else {
          res.send({ message: "User was registered successfully!" });
        }
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      console.log("User found:", user.email, "Role:", user.role);

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      console.log("Generated Token:", token);

      res.status(200).send({
        id: user.id,
        name: user.name, // Changed from username to name
        email: user.email,
        role: user.role,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};