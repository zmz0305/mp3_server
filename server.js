// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Task = require('./models/task');
var Llama = require('./models/llama');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://zmz:12345@ds061248.mongolab.com:61248/base');
// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  next();
};



//Default route here
// All our routes will start with /api
// Use the body-parser package in our application
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/api', router);
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});
//
function exec(model, query, limit, cb){
    model = model.find(JSON.parse(query.where || "{}"));
    if(query.sort) model.sort(JSON.parse(query.sort));
    if(query.select) model.select(JSON.parse(query.select));
    if(query.limit) model.limit(JSON.parse(query.limit) || limit);
    if(query.skip) model.skip(query.skip);
    if(query.count) model.count();
    model.exec(cb);
}
function compRetMsg(msg, data) {
    var message = msg ? msg : "OK";
    var ret = {
        message: message,
        data: data
    };
    console.log(ret);
    return ret;

}
//Llama route
var llamaRoute = router.route('/llamas');

llamaRoute.get(function(req, res) {
  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
});

//Add more routes here
var userRoute = router.route('/users');

userRoute.get(function(req, res){
    //console.log(JSON.parse(req.query.count));
    exec(User, req.query, Infinity, function(err, users){
        if(err){
            //console.log(err);
            res.json(compRetMsg(err, users));
        }
        else{
            if(users.length == 0){
                res.status(404)
                res.json(compRetMsg("not found",users));
            }
            else{
                var message = "OK";
                res.json(compRetMsg(message, users));
            }
        }
    });

});

userRoute.post(function(req, res){
    var a = new User(req.body);
    //console.log(a);
    a.save(function(err, data){
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            //console.log("save success!");
            res.status(201);
            var msg = "user added"
            res.send(compRetMsg(msg, data));
        }
    });
});



var userIdRoute = router.route('/users/:id');
userIdRoute.get(function(req, res){
    var id = req.params.id;
    User.findOne({_id:id}, function(err, users){
        if(err){
            res.status(404);
            console.log("404 not found");
            res.send(compRetMsg(err, users));
        }
        else{
            var msg = "user found";
            if(!users) {
                res.status(404);
                msg = "no user found";
                res.send(compRetMsg(msg, users))
            }
            else{
                res.send(compRetMsg("OK", users));
            }
        }
    });
});

userIdRoute.put(function(req, res){
    var id = req.params.id;
    //if(req.query.name){
    //    var name = req.query.name;
    //}
    //if(req.query.email){
    //    var email = req.query.email;
    //}
    //if(req.query.pendingTasks){
    //    var pTasks = req.query.pendingTasks;
    //}
    User.findByIdAndUpdate(id, {$set: req.body}, function(err, users){
        if(err){
            res.status(404);
            res.send(compRetMsg("404 not found :)", users));
        }
        else{
            res.status(201);
            res.send(compRetMsg("user updated!", users));
        }
    });
});

userIdRoute.delete(function(req, res){
    var id = req.params.id;
    User.remove({_id: id}, function(err, amount){
        if(err){
            console.log("error in delete by user id");
            res.status(404);
            res.send(compRetMsg(err, users));
        }
        else{
            console.log(amount);
            if(!amount){
                res.status(404);
                res.send(compRetMsg("try to delete non-exist user", amount));
            }
            else{
                res.send(compRetMsg("deleted", amount));
            }
        }
    });
});

var taskRoute = router.route('/tasks');
taskRoute.get(function(req, res){
    exec(Task, req.query, 100, function(err, tasks){
        if(err){
            res.send(compRetMsg(err, tasks));
        }
        else{
            if(!tasks || tasks.length==0){
                res.status(404);
                res.send(compRetMsg("not found", tasks));
            }
            else{
                res.send(compRetMsg("OK", tasks));
            }
        }
    });
});

taskRoute.post(function(req, res){
    var a = new Task();
    a.name=req.body.name;
    a.email=req.body.email;
    a.save(function(err, tasks){
        if(err){
            res.send(compRetMsg("task post error", tasks));
        }
        else{
            var msg = "tasks added";
            res.status(201);
            res.send(compRetMsg(msg, tasks));
        }
    });

});

//taskRoute.post(function(req,res){
//    var name= req.query.name;
//    var description= req.query.description;
//    var deadline= req.query.deadline;
//    var completed = req.query.completed;
//    var assignedUser = req.query.assignedUser;
//    var assignedUserName = req.query.assignedUserName;
//    var a = new Task({"name":name,"description":description,"deadline":deadline,"completed":completed,"assignedUser":assignedUser,"assignedUserName":assignedUserName,"dateCreated":Date.now()});
//    a.save(function(err,a){
//        if(err){
//            console.log(err);
//            res.send(err);
//        }
//        else{
//            console.log("Save Successful");
//            res.send(a);
//        }
//    })
//});
var taskIdRouter = router.route('/tasks/:id');
taskIdRouter.get(function(req, res){
    var id = req.params.id;
    Task.findOne({_id:id}, function(err, tasks){
        if(err){
            res.send(compRetMsg(err, tasks));
        }
        else{
            if(!tasks || tasks.length==0){
                res.status(404);
                res.send(compRetMsg(err, tasks));
            }
            else{
                res.send(compRetMsg("task got!", tasks));
            }
        }
    });
});

taskIdRouter.put(function(req, res){
    var id = req.params.id;
    //if(req.query.name){
    //    var name = req.query.name;
    //}
    //if(req.query.description){
    //    var description = req.query.description;
    //}
    //if(req.query.deadline){
    //    var deadline = req.query.deadline;
    //}
    //if(req.query.completed){
    //    var completed = req.query.completed;
    //}
    //if(req.query.assignedUser){
    //    var assignedUser = req.query.assignedUser;
    //}
    //if(req.query.assignedUserName){
    //    var assignedUserName = req.query.assignedUserName;
    //}
    Task.findByIdAndUpdate(id, {$set: req.body}, function(err, tasks){
        if(err){
            console.log(err);
            res.send(compRetMsg(err, tasks));
        }
        else{
            if(!tasks){
                res.status(404);
                res.send(compRetMsg("404 not found :)", tasks))
            }
            else{
                res.send(compRetMsg("task updated", tasks));
            }
        }
    });
});

taskIdRouter.delete(function(req, res){
    var id = req.params.id;
    Task.remove({_id: id}, function(err, tasks){
        if(err){
            res.send(compRetMsg(err, tasks));
        }
        else{
            console.log(tasks);
            if(!tasks){
                res.status(404);
                res.send("404 not found :)");
            }
            else{
                res.send(compRetMsg("task deleted", tasks));
            }
        }
    });
});

userRoute.options(function(req, res){
    res.writeHead(200);
    res.end();
});

taskRoute.options(function(req, res){
    res.writeHead(200);
    res.end();
});

userIdRoute.options(function(req, res){
    res.writeHead(200);
    res.end();
});

taskIdRouter.options(function(req, res){
    res.writeHead(200);
    res.end();
});
// Start the server
app.listen(port);
console.log('Server running on port ' + port); 