var express      = require('express'),
    bodyParser   = require('body-parser'),
    fs           = require('fs'),
    cors         = require('cors'),
    regdb        = require('./reg_connect');

var app = express();
app.use(cors());
app.use(bodyParser.json());// support json encoded bodies
app.use(bodyParser.urlencoded({extended: false}));// support encoded bodies
// app.use(passport.initialize());

app.get("/getStudentInfo/:studentId",  function(req, res){
  regdb.getStudent(req.params.studentId).then(function(student) {
     res.json({'result':student});
  }).catch(function(err) {
    res.json({'error':err});
  });
});

app.get("/getProgram/:programId",  function(req, res){
  console.log('get_program',req.params.programId);
  regdb.getProgram(req.params.programId).then(function(program) {
     res.json({'result':program});
  })
  .catch(function(err) {
    res.json({'error':err});
  });
});

app.get("/getFaculty/:facultyId",  function(req, res){
  console.log('get_faculty',req.params.facultyId);
  regdb.getFaculty(req.params.facultyId).then(function(faculty) {
     res.json({'result':faculty});
  })
  .catch(function(err) {
    res.json({'error':err});
  });
});

app.get("/getLevel/:levelId",  function(req, res){
  console.log('get_level',req.params.levelId);
  regdb.getLevel(req.params.levelId).then(function(level) {
     res.json({'result':level});
  })
  .catch(function(err) {
    res.json({'error':err});
  });
});


app.listen(3000);


