const { authJwt } = require("../middleware");
const controller = require("../controllers/store.controller");
const reviewController = require("../controllers/review.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/stores",
    [authJwt.verifyToken],
    controller.getStores
  );

  app.get(
    "/api/stores/:storeId",
    [authJwt.verifyToken],
    controller.getStoreById
  );

  // Review routes
  app.post(
    "/api/stores/:storeId/reviews",
    [authJwt.verifyToken],
    reviewController.createReview
  );

  app.get(
    "/api/stores/:storeId/reviews",
    reviewController.getReviewsByStore
  );

  app.get(
    "/api/users/:userId/reviews",
    [authJwt.verifyToken],
    reviewController.getReviewsByUser
  );

  app.get(
    "/api/stores/:storeId/reviews/user/:userId",
    [authJwt.verifyToken],
    reviewController.getReviewByUserAndStore
  );

  app.put(
    "/api/stores/:storeId/reviews/:reviewId",
    [authJwt.verifyToken],
    reviewController.updateReview
  );
};