
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Review = require('../models/review');
const userHasReview = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ message: "user not authorized" });
  }

        const token = authorization.split(" ")[1];
        const { userId } = jwt.verify(token, process.env.JWT_ACCESS);
        const user = await User.findByPk(userId);
        const productId = req.params.productId;
        const reviewId = req.params.reviewId;

         await Review.findOne({ where: { id: reviewId } }).then(async (review) => {
            if(review){
            if(review.ProductId !== productId && review.UserId !== userId){
               res.status(403).send({message: "user not authorized"})
            }else{
                next()
            }  
         }else{
            res.status(403).send({message: "user not authorized"})
         }
        });
}

module.exports = userHasReview;