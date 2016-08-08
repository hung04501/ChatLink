var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var app = require('./app');
var Message=require('./models/message');

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 4000);
var express = require('express');

var app = require('./app');

app.set('port', process.env.PORT || 4000);

var fs = require('fs');
var server = require('http').createServer(app),
    io = require('socket.io').listen(server);
	
var _ = require('underscore')._;

var request = require('request');
var cheerio = require('cheerio');

app.get('/', function(resuest, response) {
  response.sendFile(__dirname+'/index.html');
});

// app.use(express.static('emotion'));
app.use('/emotion', express.static('emotion'));
app.use('/bootstrap', express.static('bootstrap'));

//socket
var UserDetails = {};
var inforLink= {};
var clients = [];
var people ={};
var rooms ={};
io.sockets.on('connection', function(socket) {
		var record = 50;
		function isInArray(value, array) {
		  return array.indexOf(value) > -1;
		}
		//get list user online
		socket.on('useronline', function(ip) {
			var usernameOnline = getProperty(ip);
			var ownerRoomID = inRoomID = null;
			if(ip!=null) {
				if(!isInArray(usernameOnline,clients)){
				clients.push(usernameOnline);
				
				people[socket.id] = {"userName":usernameOnline,"ownerRoomID":ownerRoomID,"inRoom":inRoomID};
				sizePeople = _.size(people);
			sizeRooms = _.size(rooms);
			io.sockets.emit("update-people", {people: people, count: sizePeople});

				}
				io.sockets.emit('listuser_online',clients);
				console.log(clients);
			}
			
			
			
			//clients=[];
		});
		//who disconnect
		socket.on('disconnect', function(ip) {
			var usernameOffline = getProperty(ip);
			clients.splice(clients.indexOf(usernameOffline, 1));
			console.log("user logout"+usernameOffline);
		});
		//view more record
		socket.on('viewmore', function(numrecord) {
			console.log(numrecord);
			record = numrecord;
			//show all chat
			var cursord  = Message.find().limit(record).sort({$natural : -1,timechat: 'asc'});
			  cursord.exec(function(err, messages) {
				//if (err) return console.error(err);
				//console.log(messages);
				io.sockets.emit('showallchat', messages.reverse());
			  });
		});
		//show all chat
		var cursord  = Message.find().limit(record).sort({$natural : -1,timechat: 'asc'});
		  cursord.exec(function(err, messages) {
			//if (err) return console.error(err);
			//console.log(messages);
			io.sockets.emit('showallchat', messages.reverse());
		  });
		// Message.find(function(err, messages) {
		  // if (err) return console.error(err);
		  // console.log(messages);
		  // io.sockets.emit('showallchat', messages);
		// }).limit(3).sort({timechat: 'asc'});
	//get message from client
	
	//check message have link
		function checkLink(msgLink){
			return haveLink = msgLink.indexOf("http") !== -1 ||  msgLink.indexOf("https") !== -1;
		}
	
	//get meta data before display message to Client
	function getMetadata(msgHaveLink){
		return new Promise(function(resolve, reject) {

			var contentLink = {};
			request(msgHaveLink, function (error, response, html) {
			  if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html);

				var title = $('meta[property="og:title"]').attr("content");
				var description = $('meta[property="og:description"]').attr("content");
				var img = $('meta[property="og:image"]').attr("content");
				contentLink.title = title;
				contentLink.description = description;
				contentLink.img = img;
				resolve(contentLink);
			  }
			});
		});
	}
	//broadcast message for All Client
	socket.on('sendchat', function (data) {
		console.log('-----------------------------'+data);
		//get currentday
		var today = new Date();
		var miliseconds = today.getTime();

		console.log(today.getHours() +':'+ today.getMinutes());
		//set details msg to Client
		 UserDetails.ipClient = data.ipClient;
		 UserDetails.username = getProperty(data.ipClient);
		 UserDetails.timechat = miliseconds;
		 //set content link
		 var haveLink = data.message.indexOf("http") !== -1 ||  data.message.indexOf("https") !== -1;
		 if(haveLink) {
			getMetadata(data.message).then(function(response) {
			  console.log("Success!", response);
			  //set content to UserDetails 
				UserDetails.title = response.title;
				UserDetails.description = response.description;
				UserDetails.img = response.img;
				//set inforLink order to save DB
					inforLink.title = response.title;
					inforLink.description = response.description;
					inforLink.img = response.img;
					
			}).then(function (response){
				//find last record in DB
				var cursor  = Message.find().limit(1).sort({ $natural : -1 });
				  cursor.exec(function(err, results) {
					if (err) throw err;
					if(results.length) {
					UserDetails.same = data.ipClient == results[0].ipClient ? true : false;
					console.log('ip same :'+UserDetails.same);
					if(typeof UserDetails != "undefined" ){
						io.sockets.emit('updatechat',UserDetails, data.message);
					 }else{
						io.sockets.emit('updatechat',UserDetails, data.message);
					 }
					UserDetails.title = "";
					UserDetails.description = "";
					UserDetails.img = "";
					
					}
				  });
				  //message save to DB
				 var message=new Message({
					ipClient:data.ipClient,
					clientName:getProperty(data.ipClient),
					message:data.message,
					timechat:miliseconds,
					title:inforLink.title,
					description:inforLink.description,
					img:inforLink.img
				 });
				 //save db mongoose
				message.save(function(err, thor) {
				  if (err) return console.error(err);
				  console.dir(thor);
				});
			});
		 } else{
			//find last record in DB
			var cursor  = Message.find().limit(1).sort({ $natural : -1 });
			  cursor.exec(function(err, results) {
				if (err) throw err;
				if(results.length) {
				UserDetails.same = data.ipClient == results[0].ipClient ? true : false;
				console.log('ip same :'+UserDetails.same);
				io.sockets.emit('updatechat',UserDetails, data.message);
				}
			  });
			  //message save to DB
				 var message=new Message({
					ipClient:data.ipClient,
					clientName:getProperty(data.ipClient),
					message:data.message,
					timechat:miliseconds
				 });
				 //save db mongoose
				message.save(function(err, thor) {
				  if (err) return console.error(err);
				  console.dir(thor);
				});
		 }
		 
		 
		 
		 
	});
  
	  //check typing
	  var arrayUserTyping = [];
	  var arrayIpTyping = [];
	  socket.on('isTyping', function (data) {
			var userNameTyping = getProperty(data);
			if(!isInArray(userNameTyping,arrayUserTyping)){
				arrayUserTyping.push(userNameTyping);
			}
			if(!isInArray(data,arrayIpTyping)){
				arrayIpTyping.push(data);
			}
		io.sockets.emit('updateStatusTyping',arrayUserTyping,arrayIpTyping);
	  });
	  socket.on('longTyping', function (data) {
		io.sockets.emit('updateStatuslongTyping',data);
	  });
	  
  
	  //join a room
	  socket.on('subscribe_room', function(room) { 
			console.log('joining room', room);
			socket.join(room); 
		})
	//leave room
		socket.on('unsubscribe_room', function(room) {  
			console.log('leaving room', room);
			socket.leave(room); 
		})
	//send to joined room 
		socket.on('sendmsg_room', function(data) {
			console.log('sending message');
			io.sockets.in(data.room).emit('message_room', data.message);
		});
  
});




//map ip client
var map = new Object(); // or var map = {};
//read file

const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('listip.txt')
});

rl.on('line', function (line) {
  //console.log('Line from file:', line);
  var ipuser = line.substring(0, line.indexOf("@"));
  //var nickname = line.substring(12, line.length);
  var nickname = line.substring(16, line.length);
  //set nickname to ip
  map[ipuser] = nickname;
  
  //console.log(getProperty(ipuser)+'\n');
  //console.log(map.getKeyByValue(nickname)+'\n');
});

//get value map theo key
var getProperty = function get(k) {
    return map[k];
}
//get key from value
Object.defineProperty( Object.prototype, 'getKeyByValue', {
    value: function() {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
}
});

//port
server.listen(app.get('port'), function () {
  console.log('Listening on port ' + server.address().port)
});