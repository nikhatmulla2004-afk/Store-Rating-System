const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/admin.controller");
const storeController = require("../controllers/store.controller");
const userController = require("../controllers/user.controller");
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
    "/api/admin/stats",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getStats
  );

  app.post(
    "/api/admin/users",
    [
      authJwt.verifyToken,
      authJwt.isAdmin,
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.createUser
  );

  app.get(
    "/api/admin/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUsers
  );

  app.delete(
    "/api/admin/users/:userId",
    [authJwt.verifyToken, authJwt.isAdmin],
    userController.deleteUser
  );

  app.post(
    "/api/admin/stores",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createStore
  );

  app.get(
    "/api/admin/stores",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getStores
  );

  app.delete(
    "/api/admin/stores/:storeId",
    [authJwt.verifyToken, authJwt.isAdmin],
    storeController.deleteStore
  );

  app.delete(
    "/api/admin/ratings/:ratingId",
    [authJwt.verifyToken, authJwt.isAdmin],
    reviewController.deleteReview
  );
};