const express = require('express');
const router = express.Router();
const { client } = require('../utils/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Crear orden de PayPal
router.post('/crear-orden', async (req, res) => {
  const { titulo, precio } = req.body;

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'EUR',
          value: precio
        },
        description: titulo
      }
    ],
    application_context: {
      return_url: 'http://localhost:4200/pago-exito',  // Frontend para éxito
      cancel_url: 'http://localhost:4200/pago-cancelado' // Frontend para cancelado
    }
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    console.log(process.env.PAYPAL_CLIENT_ID)
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

module.exports = router;
