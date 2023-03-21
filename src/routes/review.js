const {createReview, deleteReview} = require('../controllers/review');
const router = require('express').Router();
const userHasReview = require('../middlewares/userHasReview');
router.post('/products/:productId/reviews', createReview);
router.delete('/products/:productId/reviews/:reviewId', userHasReview,  deleteReview);


module.exports = router;
