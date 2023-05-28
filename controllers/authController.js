const fs = require("fs");
const authService = require("../service/authService");

class authController {
  async signIn(req, res, next){
      const { body, file } = req;
      try {
        const user = await authService.signIn(body, file);

        res.cookie('refreshToken', user.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly:true})

        res.status(200).send(user);
      } catch (error) {
        if (file) {
          await fs.promises.unlink(`uploads/images/${file.filename}`);
        }
        next(error);
      }
    }

    async logIn(req, res, next){
    const { body} = req;
    try {
      const user = await authService.logIn(body);
      res.cookie('refreshToken', user.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly:true})
      res.status(200).send(user);
    }
    catch (error) {
      next(error);
    }
  }

  async logout(req, res, next){
    try {
      const {refreshToken} = req.cookies;
      console.log(req.cookies); 
      const token = await authService.logoutUser(refreshToken);

      res.clearCookie("refreshToken");
      
      res.status(200).send('Succsesful Logout!');
    }
    catch (error) {
      next(error);
    } 
  }
  
  async activate(req, res, next){
    const {body} = req;
    try {
      const activate = await authService.activate(body)

      res.status(200).send(activate);
    }
    catch (error) {
      next(error);
    }
  }
  
  async refresh(req, res, next){
    const {refreshToken} = req.cookies;
    try {
    const user = await authService.refresh(refreshToken);
    res.cookie('refreshToken', user.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly:true})
    res.status(200).send(user);
    }
    catch (error) {
      next(error);
    }
  }
}
module.exports = new authController();
