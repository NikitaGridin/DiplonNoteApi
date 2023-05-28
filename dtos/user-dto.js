module.exports = class UserDto{
    id;
    email;
    isActivation;
    img;
    nickname


    constructor(model){
        this.id = model.id;
        this.email = model.email;
        this.nickname = model.nickname;
        this.isActivation = model.isActivation;
        this.img = model.img;

    }
}