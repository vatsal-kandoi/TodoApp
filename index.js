//REQUIRING
const express=require('express');
const path=require('path');
const ejs=require('ejs');
const {SHA256}=require('crypto-js');
var bodyParser=require('body-parser');
const jwt=require('jsonwebtoken');


const mongoose=require('./connect-mongoose').mongoose;
const User=require('./connect-to-mongoose').User;
const authenticate=require('./authenticate').authenticate;


const app=express();
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.use(bodyParser.json());


// GET INITIAL PAGE CHECKED
app.get('/',function(req,res){
  res.send();
});

//LOGIN AND GET TODOS CHECKED
app.post('/login',function(req,res){
  var body=req.body;
  User.findToLogin({'email':body.email,'password':SHA256(body.password)+'abc123'}).then(function(user){
    if (user){
      var token=generateToken(user);
      res.setHeader('x-auth',token);
      return User.addToken(user,token);
    }
    res.status(404).send();
  }).then(function(user){
    res.status(200).send({'name':user.name,'email':user.email,'todos':user.todos,'token':res.getHeader('x-auth')})
  }).catch(function(e){
    res.status(400).send();
  });
});

//CHECKED
var generateToken=function(user){
  return jwt.sign({"access":"auth","id":user._id,"date":new Date()},'123abc').toString();
}

//SIGNUP CHECKED
app.post('/signup',function(req,res){
  User.preventDuplicate(req.body.email).then(function(user){
    if(user){res.status(404).send('User exists');}
    else{
      var user=new User({name:req.body.name,password:SHA256(req.body.password)+'abc123',email:req.body.email});
      user.save().then(function(user){
        var token=generateToken(user);
        res.setHeader('x-auth',token);
        return User.addToken(user,token);
      }).then(function(user){
        res.status(200).send({'email':user.email,'name':user.name,'token':res.getHeader('x-auth')});
      }).catch(function(e){
        console.log(e);
        res.status(400).send();
      })
    }
  }).catch(function(err){
    res.status(400).send();
  });
});

//LOGOUT CHECKED
app.delete('/user/logout',authenticate,function(req,res){
  var body=req.body;
  User.removeToken({'email':body.email,'password':SHA256(body.password)+'abc123'},req.header('x-auth')).then(function(user){
      res.status(200).send('Token removed. Logged out');
    },function(err){
      res.status(401).send();
    }
  );
});

//TO REMOVE USER DATA CHECKED
app.delete('/user',authenticate,function(req,res){
  var body=req.body;
  User.removeUser({'email':body.email,'password':SHA256(body.password)+'abc123'}).then(function(user){
    if(user){
      res.status(200).send('User deleted');
    } else{
      res.status(400).send();
    }
  }).catch(function(err){
    res.status(400).send();
  });
});

//ADD TODOS CHECKED
app.post('/user/todos',authenticate,function(req,res){
  var body=req.body;
  User.addToDo({'email':body.email,'task':body.task}).then(function(doc){
    if(doc){
      res.setHeader('x-auth',req.header('x-auth'));
      res.status(200).send({'name':doc.name,'email':doc.email,'token':req.header('x-auth'),'todos':doc.todos})
    } else{
      console.log(1);
      res.status(404).send();
    }
  }).catch(function(err){
    console.log(err);
    res.status(400).send();
  });

});

//REMOVE TODOS //CHECKED
app.delete('/user/todos',authenticate,function(req,res){
  var body=req.body;
  User.removeToDo({'email':body.email,"task":body.task}).then(function(doc){
    if(doc){
      res.setHeader('x-auth',req.header('x-auth'));
      res.status(200).send({'name':doc.name,'email':doc.email,'token':req.header('x-auth'),'todos':doc.todos})
    }
    res.status(404).send()
  });
});

//MODIFY TODOS
app.patch('/user/todos',authenticate,function(req,res){
  var body=req.body;
  User.removeToDo({'email':body.email,"task":body.task}).then(function(doc){
    if(doc){
      return User.addToDo2({'email':body.email,"task":body.task,"completed":true,"completedat":new Date()});
    }
    res.status(404).send();
  }).then(function(doc){
    if(doc){
      res.setHeader('x-auth',req.header('x-auth'));
      res.status(200).send({'name':doc.name,'email':doc.email,'token':req.header('x-auth'),'todos':doc.todos});
    }
    res.status(404).send();
  }).catch(function(err){
    console.log(err);
    res.status(400).send();
  });
});

app.listen(process.env.PORT);
