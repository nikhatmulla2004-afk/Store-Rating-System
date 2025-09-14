module.exports = (sequelize, Sequelize) => {
  const Store = sequelize.define("stores", {
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    }
  });

  return Store;
};