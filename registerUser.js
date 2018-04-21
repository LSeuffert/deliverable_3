var mysql = require("mysql");

var connection = mysql.createConnection((
  host: "pickpeople.mynetgear.com"
  user: "faizan"
  password: "GehaniTime70"
  database: "cs631"
));

var express = require("express");
var myParser = require("body-parser");
var app = express();

app.use(myParser.urlencoded(extended:true));
app.post("/registeruser", function(request,response){
   var post = request.body;

   con.connect(function(err)){
     if(err) throw err;
     console.log("Connected");
     var query = connection.query('INSERT INTO CUSTOMER SET ?', post, function(error, results,fields)){
       if(error){
         throw error;
       }
       else{
         console.log("SucSAAAAAAAXX");
       }
     }
   }
});
