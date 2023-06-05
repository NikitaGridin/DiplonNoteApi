const { User } = require("../models/association");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const MailService = require("./mailService");

const tokenService = require("./tokenService");
const UserDto = require("../dtos/user-dto");
class authService {
  async signIn(body, img, next) {
    try {
      const { nickname, email, password, password_repeat } = body;
      if (!nickname || !email || !password || !img || !password_repeat) {
        throw Object.assign(new Error("Пожалуйста, заполните все поля!"), {
          statusCode: 400,
        });
      }
      const userEmail = await User.findOne({ where: { email } });
      if (userEmail) {
        throw Object.assign(new Error(`Данный Email занят!`), {
          statusCode: 409,
        });
      }
      const userNickname = await User.findOne({ where: { nickname } });
      if (userNickname) {
        throw Object.assign(new Error(`Данный Nickanme занят!`), {
          statusCode: 409,
        });
      }
      if (password != password_repeat) {
        throw Object.assign(new Error(`Пароли не совпадают!`), {
          statusCode: 409,
        });
      }
      const activationCode = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");

      await MailService.sendActivationMail(email, activationCode, nickname);

      const role = "User";
      const password_hash = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        nickname,
        email,
        password: password_hash,
        img: img.filename,
        role,
        activationCode,
      });

      const payload = new UserDto(newUser);
      const tokens = tokenService.generateToken({ ...payload });

      await tokenService.saveToken(payload.id, tokens.refreshToken);

      return { ...tokens, user: payload };
    } catch (error) {
      throw error;
    }
  }

  async logIn(body) {
    try {
      const { nickname, password } = body;
      if (!nickname || !password) {
        throw Object.assign(new Error("Пожалуйста, заполните все поля!"), {
          statusCode: 400,
        });
      }
      const user = await User.findOne({ where: { nickname } });
      if (!user) {
        throw Object.assign(new Error("Данные неверны!"), { statusCode: 404 });
      }

      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) {
        throw Object.assign(new Error("Данные неверны!"), { statusCode: 400 });
      }

      if (user.isActivation === false) {
        throw Object.assign(new Error("Аккаунт не активирован!"), {
          statusCode: 400,
        });
      }

      const payload = new UserDto(user);
      const tokens = tokenService.generateToken({ ...payload });

      await tokenService.saveToken(payload.id, tokens.refreshToken);
      return { ...tokens, user: payload };
    } catch (error) {
      throw error;
    }
  }

  async logoutUser(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async activate(body) {
    try {
      const { code } = body;

      const activationCode = parseInt(code);
      const user = await User.findOne({
        where: { activationCode: activationCode },
      });

      if (!user) {
        throw Object.assign(new Error(`Код неверный!`), { statusCode: 404 });
      }
      user.isActivation = true;
      await user.save();

      const payload = new UserDto(user);
      const tokens = tokenService.generateToken({ ...payload });

      await tokenService.saveToken(payload.id, tokens.refreshToken);

      return { ...tokens, user: payload };
    } catch (error) {
      throw error;
    }
  }

  async refresh(refreshToken) {
    try {
      if (!refreshToken) {
        throw Object.assign(new Error(`Пользователь не авторизован`), {
          statusCode: 404,
        });
      }

      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = tokenService.findToken(refreshToken);

      if (!userData || !tokenFromDb) {
        throw Object.assign(new Error(`Пользователь не найден`), {
          statusCode: 404,
        });
      }

      const user = await User.findByPk(userData.id);
      const payload = new UserDto(user);
      const tokens = tokenService.generateToken({ ...payload });

      await tokenService.saveToken(payload.id, tokens.refreshToken);
      return { ...tokens, user: payload };
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new authService();
