var oracledb = require('oracledb');
var pool = null;
var creating = false;
var argv = require('minimist')(process.argv.slice(2));
var dbConfig = require('./dbconfig.js');



var sem = require('semaphore')(1);

var getPool = function(cb) {
  sem.take(function() {
    if(pool == null) {
      oracledb.createPool({ 
        user : dbConfig.user,
        password : dbConfig.password,
        connectString : dbConfig.connectString,
        poolMax:1
     },function(err,_pool) {
       sem.leave();
       if(!err) {
         pool = _pool;
         cb(_pool);
       }
     });
   } else {
     sem.leave();
     cb(pool);
   }
  });
};

var getStudent = function(student) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
        if(!err) {
          var selectStatement = "SELECT * from AVSREG.GRAD_STUDENTINFO"+
           " where STUDENTCODE = '"+ student + "'";
          conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
            conn.close();
            if (err) {
              reject(err);
            } else {
              fulfill(results.rows);
            }
          });
        } else {
          reject(err);
        }
      }); 
    });
  });
}


var get_program = function(program) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var selectStatement = "SELECT * from  AVSREG.GRAD_PROGRAM_NEW " +
        " where PROGRAMID = '"+ program + "'";
      conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
        conn.close();   
        if (err) {
          reject(err);
        } else {
          fulfill(results.rows);
        }
      });
     });
    });
  });
}


var get_faculty = function(faculty) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
        if(!err) {
          var selectStatement = "SELECT * from AVSREG.GRAD_FACULTY " +
            " where FACULTYID = '"+ faculty + "'";
          conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
            conn.close();
            if (err) {
              reject(err);
            } else {
              fulfill(results.rows);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  });
}


var get_level = function(level) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var selectStatement = "SELECT * from AVSREG.GRAD_LEVELID " +
       " where LEVELID = '"+ level + "'";
      conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
        conn.close();
        if (err) {
          reject(err);
        } else {
          fulfill(results.rows);
        }
      });
     });
    });
  });
}

var get_degree = function(degree) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var selectStatement = "SELECT * from AVSREG.GRAD_DEGREE " +
       " where DEGREEID = '"+ degree + "'";
      conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
        conn.close();
        if (err) {
          reject(err);
        } else {
          fulfill(results.rows);
        }
      });
     });
    });
  });
}
var getCoreStudent = function(student) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var selectStatement = "SELECT * from AVSREG.GRAD_STUDENTINFO"+
       " where STUDENTCODE = '"+ student + "'";
      conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
        conn.close();
        if (err) {
          reject(err);
        } else {
          fulfill(results.rows);
        }
      });
     });
  });
 });
}

var getTranscript = function(student) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var selectStatement = "SELECT * from AVSREG.GRAD_STUDENTRANSCRIPT"+
       " where STUDENTCODE = '"+ student + "' ORDER BY ACADYEAR,SEMESTER ASC";
      conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
        conn.close();
        if (err) {
          reject(err);
        } else {
          fulfill(results.rows);
        }
      });
     });
  });
 });
}

var listFaculty = function() {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
        if(!err) {
          var selectStatement = "SELECT * from AVSREG.GRAD_FACULTY "; 
          conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
            conn.close();
            if (err) {
              reject(err);
            } else {
              fulfill(results.rows);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  });
}

var listProgram = function(faculty) {
  return new Promise(function(fulfill, reject) {
    getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var programs = [];

      var recursiveQuery = function(programID) {
        var selectStatement = "SELECT * "+ 
          " FROM AVSREG.GRAD_PROGRAM_NEW "+
          " WHERE PROGRAMSTATUS = '40' AND FACULTYID = '"+ faculty + "'" +
          " AND PROGRAMID > '"+programID+"' " +
          " ORDER BY PROGRAMID";
          console.log(selectStatement);
          conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
            if (err) {
              conn.close();
              reject(err);
            } else {
              if(results.rows.length) {
                programs.push.apply(programs,results.rows)
                recursiveQuery(results.rows[results.rows.length-1].PROGRAMID);
              } else {
                conn.close();
                var programDict = {};
                var result = [];
                programs.forEach((item) => {
                  programDict[item.PROGRAMNAME] = item.PROGRAMNAME;
                });
                for(var key in programDict) {
                  result.push(key);
                }
                fulfill(result);
              }
            }
         });
      };

      recursiveQuery('1');
     });

  });
 });
}
/*Old Program*/
var getActiveStudentbyProgram = function(faculty) {
    return new Promise(function(fulfill, reject) {
     listProgram(faculty).then((programNames) => {
      getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var programs = [];

      var orQuery = programNames.map((program) => "A1.PROGRAMNAME = '"+program+"'")
      .reduce((acc,current,idx) => {
        if(idx ===0) return acc + current;
        return acc +' OR '+current;
      }, '(');

      var recursiveQuery = function(studentCode) {
        var selectStatement = "SELECT "+
          " A1.STUDENTCODE, "+
          " A1.STUDENTSTATUS, "+
          " A1.ADMITACADYEAR, "+
          " A1.PROGRAMNAME, "+
          " A1.PROGRAMID, "+
          " A1.LEVELID, "+
          " A1.ADMITSEMESTER "+
          " FROM AVSREG.GRAD_STUDENTINFO A1 "+
          " WHERE "+
          orQuery +") AND "+
          " A1.STUDENTCODE > '"+studentCode+"' " +
          //" AND A1.ADMITACADYEAR = "+year+" " +
          " AND A1.ADMITACADYEAR > 2553 "+
          " ORDER BY A1.STUDENTCODE";

          console.log(selectStatement);
          conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
            if (err) {
              conn.close();
              reject(err);
            } else {
              console.log(results.rows.length);
              if(results.rows.length) {
                programs.push.apply(programs,results.rows)
                recursiveQuery(results.rows[results.rows.length-1].STUDENTCODE);
              } else {
                conn.close();
                //console.log(programs);
                fulfill(programs);
              }
            }
         });
      };
       recursiveQuery('1');

     });
    });

   });
 });
}


var getStudentProgram = function(values) {
    return new Promise(function(fulfill, reject) {
     //listProgram(faculty).then((programNames) => {
      getPool(function(pool) {
      pool.getConnection(function(err,conn) {
      var programs = [];
      /*var orQuery = programNames.map((program) => "A1.PROGRAMNAME = '"+program+"'")
      .reduce((acc,current,idx) => { 
        if(idx ===0) return acc + current; 
        return acc +' OR '+current;
      }, '(');
      */
      var recursiveQuery = function(studentCode) {
        var selectStatement = "SELECT "+ 
          " A1.STUDENTCODE, "+
          " A1.STUDENTSTATUS, "+
          " A1.ADMITACADYEAR, "+
          " A1.PROGRAMNAME, "+
          " A1.PROGRAMID, "+
          " A1.LEVELID, "+
          " A1.ADMITSEMESTER "+
          " FROM AVSREG.GRAD_STUDENTINFO A1 "+
          " WHERE "+
       //   orQuery +") AND "+
          " A1.STUDENTCODE > '"+studentCode+"' " +
          " AND A1.ADMITACADYEAR > "+values['year']+" " +
          " AND A1.PROGRAMNAME = '"+values['programName']+"' " +
          " ORDER BY A1.STUDENTCODE";
          console.log(selectStatement);
          conn.execute(selectStatement,{},{outFormat: oracledb.OBJECT},function(err, results) {
            if (err) {
              conn.close();
              reject(err);
            } else {
              console.log(results.rows.length);
              if(results.rows.length) {
                programs.push.apply(programs,results.rows)
                recursiveQuery(results.rows[results.rows.length-1].STUDENTCODE);
              } else {
                conn.close();
                //console.log(programs);
                fulfill(programs);
              }
            }
         });
      };
       recursiveQuery('1');

     });
    });

   //});
 });
}


module.exports.getStudent = getStudent;
module.exports.getProgram = get_program;
module.exports.getFaculty = get_faculty;
module.exports.getLevel = get_level;
module.exports.getDegree = get_degree;
module.exports.getTranscript = getTranscript;
module.exports.getCoreStudent = getCoreStudent;

module.exports.getActiveStudentbyProgram = getActiveStudentbyProgram;
module.exports.listProgram = listProgram;
module.exports.listFaculty = listFaculty;
module.exports.getStudentProgram = getStudentProgram;




