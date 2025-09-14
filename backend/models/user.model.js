module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.ENUM('System Administrator', 'Normal User', 'Store Owner')
    }
  });

  return User;
};