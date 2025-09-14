module.exports = (sequelize, Sequelize) => {
  const Rating = sequelize.define("ratings", {
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });

  return Rating;
};