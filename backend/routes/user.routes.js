const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const storeController = require("../controllers/store.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get(
    "/api/test/user",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.get(
    "/api/test/storeowner",
    [authJwt.verifyToken, authJwt.isStoreOwner],
    controller.storeOwnerBoard
  );

  app.put(
    "/api/user/change-password",
    [authJwt.verifyToken],
    controller.changePassword
  );

  app.get(
    "/api/user/stores",
    [authJwt.verifyToken],
    storeController.getOwnedStores
  );
};