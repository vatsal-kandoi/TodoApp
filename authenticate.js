const jwt=require('jsonwebtoken');

const User=require('./connect-to-mongoose').User;

//CHECKED
var authenticate=function(req,res,next){
  var flag=0;
  var token=req.header('x-auth');
  var decoded;
  try{
    decoded=jwt.verify(token,'123abc');
    flag=1;
  } catch(err){
    res.status(401).send();
  }
  if(flag==1){
  User.findByToken(decoded.id,token).then(function(user){
    if(user){
      next();
    } else{
      res.status(404).send();
    }},function(err){
      res.status(400).send();
      console.log('Not authorised');
    });
  }
}

module.exports.authenticate=authenticate;
