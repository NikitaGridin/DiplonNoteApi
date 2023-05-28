const nodemailer = require('nodemailer');
const validator = require('validator');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, code, recipientName) {
    if (!validator.isEmail(to)) {
      throw Object.assign(new Error('Некорректный email адрес'), { statusCode: 400 });
    }

    try {
      const info = this.transporter.sendMail({
        from: {
          name: process.env.FROM_NAME || 'Команда сайта ' + process.env.API_URL,
          address: process.env.SMTP_USER,
        },
        to,
        subject: 'Подтвердите свой аккаунт на сайте ' + process.env.API_URL,
        html: `
        <div style="background-color: #f5f5f5; padding: 40px; margin: 0 auto;">
        <div style="position: relative; width: 50%; margin: 0 auto; box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4); border-radius: 14px;">
          <h1 style="text-align: center; font-weight: bold; font-size: 3rem; margin-bottom: 20px;">Нота!</h1>
          <img src="https://images.unsplash.com/photo-1551125735-900f662aeb07?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1471&amp;q=80" style="width: 100%; height: 400px; object-fit: cover;" alt="">
          <div style="background-color: #fff; padding: 40px 25px;">
            <h2 style="font-weight: bold; font-size: 1.5rem; margin-bottom: 15px;">Здравствуйте ${recipientName}</h2>
            <div style="margin-bottom: 20px;">Благодарим вас за регистрацию на музыкальном сервисе Нота!. Вот ваш код подтверждения</div>
            <div style="text-align: center; font-weight: bold; font-size: 1.5rem;">${code}</div>
            <div style="margin-top: 20px;">С уважением, Команда Нота!</div>
          </div>
        </div>
      </div>      
        `,
      });
    } catch (error) {
      throw Object.assign(new Error('Ошибка!'), { statusCode: 500 });
    }
  }
}

module.exports = new MailService();
