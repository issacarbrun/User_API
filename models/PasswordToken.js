var knex = require("../database/connection");
var bcrypt = require("bcrypt");
var User = require('./User');
const { v4: uuidv4 } = require('uuid');

class PasswordToken{
    async createToken(email) {
       var user = await User.findByEmail(email);
        
       if( user != undefined){
            try {
                var token = uuidv4();
                await knex.insert({
                    user_id: user.id,
                    used: 0,
                    token: token
                }).table("token_password");
                console.log("Token Gerado");
                return{status: true, token: token}
            }catch (err) {
                 console.log(err);
                 return{status: false, err: err}
            }

        }else {
            return{status: false, err:"O email não pertence a nenhum usuário encontrado"}
        }
    }
    async validate(token){
        try {
            var result = await knex.select().where({token: token}).table("token_password");

            if(result.length >0){

                var tk = result[0];

                if(tk.used){
                    return {status: false};
                } else {
                    return {status: true,token: tk};
                }

            } else {
                return {status: false};
            }
        } catch (err) {
            return{status: false, err: err}
        }
        
    }
    async setUsed(token)
    {
        await knex.update({used: 1}).where({token: token}).table("token_password")
    }
    

}

module.exports = new PasswordToken();