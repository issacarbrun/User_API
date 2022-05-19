var User = require("../models/User")
var PasswordToken = require("../models/PasswordToken");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var secret = "a59151d6-fe18-4942-b87c-b6106066c011"

class UserController{
    async index(req,res){
       var users = await User.findAll();
       res.json(users); 
    }
    async findUser(req,res){
        var id = req.params.id;
        var user = await User.findById(id);
        if(user == undefined){
            res.status(404);
            res.json({});
        } else{
            res.status(200)
            res.json(user);
        }
    }
    async create(req,res){
        var {name, email, password, role} = req.body;

        if(email == undefined){
            res.status(400);
            res.json({err: 'Email inválido'})
        }
        if(name== undefined){
            res.status(400);
            res.json({err: 'Nome inválido'})
        }
        if(password == undefined){
            res.status(400);
            res.json({err: 'Senha inválido'})
        }
        console.log(req.body);


        var emailExists = await User.findEmail(email);
        
        if(emailExists){
            res.status(406);
            res.json({err: "Email já existente"});
            return;
        }

        await User.new(email,password,name);
        res.status(200);
        res.send("OK!")
    } 
    
    async edit(req,res){
        var {id,name,role,email} = req.body;
        var result = await User.update(id,email,name,role);
        if(result != undefined){
            if(result.status){
                res.status(200);
                res.send("Tudo Ok")
            } else {
                res.status(406);
                res.json(result.err)
            }
        } else {
            res.status(406);
            res.send("Error no servidor");
        }        
    }

    async remove(req,res){
        var id = req.params.id;
        var result = await User.delete(id);

        if(result.status){
            res.status(200);
            res.send("DELETADO")
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async recoverPassword(req, res) {
        var email = req.body.email;

        var result = await PasswordToken.createToken(email);
        if(result.status){
            res.status(200);
            console.log(result.token);
            res.send(result.token)
        } else {
            res.status(406);
            res.send(result.err)
        }
    }

    async changePassword(req, res) {
        var token = req.body.token;
        var new_password = req.body.password;

        var isTokenValid = await PasswordToken.validate(token);
        if(isTokenValid.status){
            await User.changePassword(new_password,isTokenValid.token.user_id,isTokenValid.token.token)
            res.status(200);
            res.send('senha alterada')
        } else {
            res.status(406);
            res.send("Token inválido")
        }
    }

    async login(req, res){
        var {email, password} = req.body;

        var user = await User.findByEmail(email);

        if(user != undefined){
           var result = await bcrypt.compare(password,user.password);
           if(result){
                var token = jwt.sign({email: user.email, role: user.role}, secret);
                res.status(200);
                res.json({token: token})
           } else {
               res.status(406);
               res.send("Senha Incorreta")
           }
           
        } else {
            res.json({status: false})
        }
    }
}

module.exports = new UserController();