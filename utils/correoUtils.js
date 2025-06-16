const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'juliobernabeublanco@gmail.com',
    pass: 'iqsu imxa maiz hbgs'
  }
});

exports.enviarCorreo = (destinatario, asunto, mensaje) => {
  const mailOptions = {
    from: 'Enfoca2 <tucorreo@gmail.com>',
    to: destinatario,
    subject: asunto,
    text: mensaje
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar correo:', error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
};
