const Review = require("../models/review");
const ApiError = require("../utils/ApiError");

const createReview = async (req, res, next) => {
    const { userId } = res.locals
    const { productId } = req.params
    const { content } = req.body

    try {
        const result = await Review.create({
            UserId: userId,
            ProductId: productId,
            content: content,
        })
        res.status(201).send(result)
    } catch (error) {
        next(error)
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params

        const result = await Review.destroy({
            where: {
                id: reviewId,
            },
        })

        if (result) {
            res.status(200).send({ message: "Review deleted successfully", id: reviewId })
        } else {
            next(ApiError.notFound("Review not found"))
        }
    } catch (error) {
        next(error)
    }
};
module.exports = { createReview, deleteReview };
