const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.storeOwnerBoard = (req, res) => {
  res.status(200).send("Store Owner Content.");
};

exports.changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.userId; // From authJwt.verifyToken middleware

  if (!oldPassword || !newPassword) {
    return res.status(400).send({ message: "Old password and new password are required!" });
  }

  User.findByPk(userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        oldPassword,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid old password!" });
      }

      // Hash new password and update
      user.password = bcrypt.hashSync(newPassword, 8);
      user.save()
        .then(() => {
          res.status(200).send({ message: "Password updated successfully!" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.userId;

  User.destroy({
    where: { id: userId }
  })
    .then(num => {
      if (num == 1) {
        res.status(200).send({ message: "User was deleted successfully!" });
      } else {
        res.status(404).send({
          message: `Cannot delete User with id=${userId}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete User with id=" + userId + ". " + err.message });
    });
};