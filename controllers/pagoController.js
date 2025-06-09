// controllers/pagoController.js
const { client } = require('../utils/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

exports.crearOrden = async (req, res) => {
  const { monto, descripcion } = req.body;

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: monto
        },
        description
      }
    ]
  });

  try {
    const response = await client().execute(request);
    res.json({ id: response.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.capturarOrden = async (req, res) => {
  const { ordenId } = req.params;

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(ordenId);
  request.requestBody({});

  try {
    const response = await client().execute(request);
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
