const db = require("../models");
const Store = db.store;
const Rating = db.rating;
const { Op } = require("sequelize");

exports.getStores = (req, res) => {
  const { name, address } = req.query;
  const userId = req.userId;
  let where = {};

  console.log("Fetching stores for userId:", userId);

  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (address) {
    where.address = { [Op.like]: `%${address}%` };
  }

  Store.findAll({
    where,
    include: [
      {
        model: Rating,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [db.sequelize.literal('COALESCE(AVG(ratings.rating), 0)'), 'averageRating'],
        [db.sequelize.literal(`(SELECT rating FROM ratings WHERE ratings.storeId = stores.id AND ratings.userId = :userId LIMIT 1)`), 'userRating']
      ]
    },
    group: ['stores.id'],
    replacements: { userId: userId }, // Pass userId as a replacement
    raw: true // To get the raw results with calculated fields
  })
    .then(stores => {
      const processedStores = stores.map(store => ({
        ...store,
        averageRating: parseFloat(store.averageRating) // Ensure it's a number
      }));
      console.log("Stores fetched successfully:", processedStores.length);
      res.status(200).send(processedStores);
    })
    .catch(err => {
      console.error("Error fetching stores:", err);
      res.status(500).send({ message: err.message });
    });
};

exports.getStoreById = (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.userId; // Assuming userId is available from authJwt.verifyToken

  Store.findByPk(storeId, {
    include: [
      {
        model: Rating,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [db.sequelize.literal('COALESCE(AVG(ratings.rating), 0)'), 'averageRating'],
        [db.sequelize.literal(`(SELECT rating FROM ratings WHERE ratings.storeId = stores.id AND ratings.userId = :userId LIMIT 1)`), 'userRating']
      ]
    },
    group: ['stores.id'],
    replacements: { userId: userId },
    raw: true
  })
    .then(store => {
      if (!store) {
        return res.status(404).send({ message: "Store Not found." });
      }
      res.status(200).send(store);
    })
    .catch(err => {
      console.error("Error fetching store by ID:", err);
      res.status(500).send({ message: err.message });
    });
};

exports.getOwnedStores = (req, res) => {
  const userId = req.userId; // From authJwt.verifyToken middleware
  console.log("Fetching owned stores for userId:", userId);

  Store.findAll({
    where: { ownerId: userId },
    include: [
      {
        model: Rating,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [db.sequelize.literal('COALESCE(AVG(ratings.rating), 0)'), 'averageRating']
      ]
    },
    group: ['stores.id'],
    raw: true
  })
    .then(stores => {
      res.status(200).send(stores);
    })
    .catch(err => {
      console.error("Error fetching owned stores:", err);
      res.status(500).send({ message: err.message });
    });
};

exports.deleteStore = (req, res) => {
  const storeId = req.params.storeId;

  Store.destroy({
    where: { id: storeId }
  })
    .then(num => {
      if (num == 1) {
        res.status(200).send({ message: "Store was deleted successfully!" });
      } else {
        res.status(404).send({
          message: `Cannot delete Store with id=${storeId}. Maybe Store was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete Store with id=" + storeId + ". " + err.message });
    });
};