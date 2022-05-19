var jwt = require("jsonwebtoken")
var secret = "a59151d6-fe18-4942-b87c-b6106066c011"
module.exports = function(req,res,next) {

    const authToken = req.headers['authorization'];

    if(authToken != undefined){
        const bearer = authToken.split(' ');
        var token = bearer[1];

        try {
            var decoded = jwt.verify(token,secret);
            console.log(decoded);
            if(decoded.role == 1){
               next();
            } else {
                res.status(403);
                res.send("Você não tem permissão");
            }
           
        } catch (err) {
            res.status(403);
            res.send("Você não está autenticado");
            return;
        }


    } else {
        res.status(403);
        res.send("Você não está autenticado")
    }
}