//CONNECTING TO  MONGOOSE
var mongoose=require('mongoose');
mongoose.Promise=global.Promise;

mongoose.connect('mongodb://localhost:27017',function(err){
  if(err){
    console.log('Error in connecting to mongoose');
  }
  else{
    console.log('Succeeded.');
  }
});

module.exports={mongoose};
