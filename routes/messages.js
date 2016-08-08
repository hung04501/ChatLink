var Message=require('../models/message');
var express=require('express');

//configure routes

var router=express.Router();

	//	http://mongoosejs.com/docs/2.7.x/docs/query.html
	
// router.route('/')
	// // .get(function (req, res) {
		// // //var query = Message.find({releaseYear: req.query.releaseYear }); 
		// // //query.where('title').equals(req.query.title);
		// // //query.where('releaseYear').gt(2017);
		// // //gte(2016).lte(2014)
		
		// // //var query = Message.find({ipclient: req.query.ipclient }); 
		// // //query.where('title').equals(req.query.title);
		// // //query.where('ipclient').eq('192.168.100.113');
		// // //gte(2016).lte(2014)
	
		// // query.exec(function (err, results) {
		  // // if (!err) {
			// // return res.send(results);
		  // // } else {
			// // return console.log(err);
		  // // }
		// // });
	// // })
	 // .post(function(req,res){
	 // console.log('abc');
        var message=new Message();
		
		
		//console.log(req);
        message.save(function(err){
            // if(err)
                // res.send(err);
            //res.send({message:'Message Added'});
        });
    // });
	
	
	
	
router.route('/messages/:id')
    .put(function(req,res){
        Message.findOne({_id:req.params.id},function(err,message){

            if(err)
                res.send(err);

           for(prop in req.body){
                message[prop]=req.body[prop];
           }

            // save the message
            message.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Message updated!' });
            });

        });
    })

    .get(function(req,res){
        Message.findOne({_id:req.params.id},function(err, message) {
            if(err)
                res.send(err);

            res.json(message);
        });
    })

    .delete(function(req,res){
        Message.remove({
            _id: req.params.id
        }, function(err, message) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports=router;
