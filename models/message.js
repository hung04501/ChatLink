
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var messageSchema=new Schema({
    ipClient:String,
	clientName:String,
    message:'String',
    timechat:'String',
	title:'String',
	description:'String',
	img:'String'
});

module.exports=mongoose.model('Message',messageSchema);