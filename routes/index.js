const express = require('express');
const router = express.Router();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const os = require('os');
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is missing. Add it to your .env file.');
}

const stripe = require('stripe')(stripeSecretKey);

transactionRouter = require('./transaction');
authRouter = require('./auth.route');
userRouter = require('./user.route');
ProductRouter = require('./product.route');
hotelRouter = require('./hotel');

router.use('/transaction', transactionRouter);

router.use('/products', ProductRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/hotels', hotelRouter);

router.get('/health',(req, res) => {
   console.log(`Health check requested. Container ID: ${os.hostname()}`);
    res.send(`Hello from Node.js instance! Container ID: ${os.hostname()}\n`);
});

router.get('/create-payment-intent', async (req, res) => {
   

  const { items } = req.body;

  try {
    // 1. Calculate the total cost securely on the server
    const amount =500// calculateOrderAmount(items);

    // 2. Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr', // e.g., 'usd', 'eur', 'inr'
      // Optional: automatic_payment_methods lets Stripe handle cards, Apple Pay, Google Pay automatically
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 3. Send the clientSecret back to the React app
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

module.exports = router;
