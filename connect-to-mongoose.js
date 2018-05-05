//REQUIRING
const mongoose=require('mongoose');
const {SHA256}=require('crypto-js');
const validator=require('validator');
const jwt=require('jsonwebtoken');

//MAKING THE USER MODEL

var userschema=mongoose.Schema({
    name:{
      type:String,
      minlength:1,
      required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
      type:String,
      required:true
    },
    tokens:[{
      token:{
        type:String
      }
    }
    ],
    todos:[{
      todo:{
        task:{
          type:String,
          minlength:1
        },
        completed:{
          type:Boolean,
          default:false
        },
        completedat:{
          type:Date,
          default:null
        }
      }
    }]
});


 //CHECKING DUPLICATES CHECKED
userschema.statics.preventDuplicate=function(email){
  return this.findOne({'email':email});
}

//MANIPULATING DATA

//CHECKED
userschema.statics.removeToken=function(details,token){
  return this.findOneAndUpdate({"email":details.email,"password":details.password,"tokens.token":token},{$pull:{"tokens":{"token":token}}});
}

//ADDING TOKEN CHECKED
userschema.statics.addToken=function(details,token){
  return User.findOneAndUpdate({"email":details.email,"password":details.password},{$push:{"tokens":{"token":token}}},{new:true});
}

//CHECKED CHECKED
userschema.statics.findByToken=function(id,token){
  return this.findOne({"_id":id,"tokens.token":token});
}

//CHECKED
userschema.statics.findToLogin=function(details){
  return this.findOne({"email":details.email,"password":details.password});
}

//CHECKED
userschema.statics.addToDo=function(details){
  return this.findOneAndUpdate({"email":details.email},{$push:{"todos":{"todo":{"task":details.task}}}},{new:true});
}

//CHECKED
userschema.statics.addToDo2=function(details){
  return this.findOneAndUpdate({"email":details.email},{$push:{"todos":{"todo":{"task":details.task,"completed":details.completed,"completedat":details.completedat}}}},{new:true});
}

userschema.statics.removeToDo=function(details){
  return this.findOneAndUpdate({"email":details.email,"todos.todo.task":details.task},{$pull:{"todos":{"task":details.task}}},{new:true});
}

///CHECKED
userschema.statics.removeUser=function(body){
  return this.findOneAndRemove({'email':body.email});
}

//MAKING THE MODEL
var User=mongoose.model('User',userschema);

module.exports={User};
