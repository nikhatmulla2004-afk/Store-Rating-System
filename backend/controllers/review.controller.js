const db = require("../models");
const Rating = db.rating;
const User = db.user;
const Store = db.store;
const Role = db.role;

// Helper to get user roles
async function getUserRoles(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] }
      }]
    });
    if (!user) return [];
    return user.roles.map(role => role.name);
  } catch (err) {
    // If error, return empty array
    return [];
  }
}

exports.createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const storeId = req.params.storeId;
  const userId = req.userId;

  if (!rating || !storeId) {
    return res.status(400).send({ message: "Rating and Store ID are required!" });
  }

  try {
    const review = await Rating.create({
      rating: rating,
      userId: userId,
      storeId: storeId,
    });
    res.status(201).send({ message: "Review added successfully!", review });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating review." });
  }
};

// Admin cannot fetch the ratings from this endpoint
exports.getReviewsByStore = async (req, res) => {
  const storeId = req.params.storeId;
  let userId = req.userId;

  // Validate storeId
  if (!storeId || isNaN(Number(storeId))) {
    return res.status(400).send({ message: "Invalid store ID." });
  }

  try {
    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).send({ message: "Store not found." });
    }

    let isAdmin = false;
    let isStoreOwner = false;
    let isOwnerOfThisStore = false;

    if (userId) {
      const roles = await getUserRoles(userId);
      isAdmin = roles.includes("admin");
      isStoreOwner = roles.includes("storeowner");

      if (isStoreOwner && store.userId && store.userId == userId) {
        isOwnerOfThisStore = true;
      }
    }

    // If admin, do not allow fetching reviews
    if (isAdmin) {
      return res.status(403).send({ message: "Admins are not allowed to fetch store reviews from this endpoint." });
    }

    // Store owner of this store or normal user can fetch reviews
    const reviews = await Rating.findAll({
      where: { storeId: storeId },
      include: [{
        model: User,
        attributes: ['name']
      }]
    });

    // For store owner of this store, you can add extra info if needed
    if (isOwnerOfThisStore) {
      return res.status(200).send({
        reviews: reviews,
        extra: "You are the store owner, so you see all reviews with user info."
      });
    }

    // For normal users, just send reviews
    return res.status(200).send(reviews);
  } catch (err) {
    // Log error for debugging
    console.error("Error in getReviewsByStore:", err);
    return res.status(500).send({ message: err.message || "Internal server error while fetching reviews." });
  }
};

exports.getReviewsByUser = async (req, res) => {
  const userId = req.params.userId;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).send({ message: "Invalid user ID." });
  }

  try {
    const reviews = await Rating.findAll({
      where: { userId: userId },
      include: [{
        model: Store,
        attributes: ['name']
      }]
    });
    res.status(200).send(reviews);
  } catch (err) {
    res.status(500).send({ message: err.message || "Internal server error while fetching user reviews." });
  }
};

exports.getReviewByUserAndStore = async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.params.userId;

  if (!storeId || isNaN(Number(storeId)) || !userId || isNaN(Number(userId))) {
    return res.status(400).send({ message: "Invalid store ID or user ID." });
  }

  try {
    const review = await Rating.findOne({
      where: { storeId: storeId, userId: userId },
      include: [{
        model: User,
        attributes: ['name']
      }]
    });
    if (!review) {
      return res.status(404).send({ message: "Review not found." });
    }
    res.status(200).send(review);
  } catch (err) {
    res.status(500).send({ message: err.message || "Internal server error while fetching review." });
  }
};

exports.updateReview = async (req, res) => {
  const storeId = req.params.storeId;
  const reviewId = req.params.reviewId;
  const { rating, comment } = req.body;
  const userId = req.userId;

  if (!rating) {
    return res.status(400).send({ message: "Rating is required!" });
  }
  if (!storeId || isNaN(Number(storeId)) || !reviewId || isNaN(Number(reviewId))) {
    return res.status(400).send({ message: "Invalid store ID or review ID." });
  }

  try {
    const [num] = await Rating.update(
      {
        rating: rating,
        comment: comment,
      },
      {
        where: { id: reviewId, storeId: storeId, userId: userId },
      }
    );
    if (num === 1) {
      res.status(200).send({ message: "Review was updated successfully." });
    } else {
      res.status(404).send({
        message: `Cannot update Review with id=${reviewId}. Maybe Review was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating Review with id=" + reviewId + ". " + (err.message || "") });
  }
};

exports.deleteReview = async (req, res) => {
  const ratingId = req.params.ratingId;

  if (!ratingId || isNaN(Number(ratingId))) {
    return res.status(400).send({ message: "Invalid review ID." });
  }

  try {
    const num = await Rating.destroy({
      where: { id: ratingId }
    });
    if (num === 1) {
      res.status(200).send({ message: "Review was deleted successfully!" });
    } else {
      res.status(404).send({
        message: `Cannot delete Review with id=${ratingId}. Maybe Review was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Could not delete Review with id=" + ratingId + ". " + (err.message || "") });
  }
};
