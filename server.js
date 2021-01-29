const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const session = require('express-session');
const pug = require('pug');
const { Session } = require('express-session');

const dbname = 'bookshelf'
const login = 'admin'
const pass = 'adminpass'
const url = 'mongodb+srv://'+login+':'+pass+'@cluster0.smxu5.mongodb.net/'+dbname+'?retryWrites=true&w=majority'

var mongobase;
const port = 3123;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
   secret: 'some-secret',
   resave: true,
   saveUninitialized: true,
   userId: '',
   sessionType: 'offline'
}));
 
 // start server
 app.listen(port,function() {
    console.log('listening on ' + port);
 })

//load files
 app.get('/styles.css', function(req,res) {
    res.sendFile(__dirname + '/styles.css');
 })

 app.get('/assets/background2.jpg', function(req,res) {
   res.sendFile(__dirname + '/assets/background2.jpg');
})
 
 app.get('/ajax.js', function(req,res) {
    res.sendFile(__dirname + '/ajax.js');
 })

 app.get('/localStorage.js', function(req,res) {
   res.sendFile(__dirname + '/localStorage.js');
})
 
//rendering pages
app.get('/', function(req,res) {
    result = pug.renderFile('templates/documentation.pug');
    res.status(200).send(result);
})
 
app.get('/login', function(req,res) {
    result = pug.renderFile('templates/login.pug');
    res.status(200).send(result);
})

app.get('/register', function(req,res) {
   result = pug.renderFile('templates/register.pug');
   res.status(200).send(result);
})

app.get('/addbook', function(req,res) {
   if(req.session.sessionType==='online'){
      result = pug.renderFile('templates/addform.pug');
      res.status(200).send(result);
   }else {
      result = pug.renderFile('templates/unauthorized.pug');
      res.status(200).send(result);
   }
   
})

app.get('/showstats', function(req,res) {
   if(req.session.sessionType==='online'){
      result = pug.renderFile('templates/analytics.pug');
      res.status(200).send(result);
   }else {
      result = pug.renderFile('templates/unauthorized.pug');
      res.status(200).send(result);
   }
   
})

app.get('/storebook', function(req,res) {
   if(req.session.sessionType==='online'){
      result = pug.renderFile('templates/authorized.pug');
      res.status(200).send(result);
   }else {
      result = pug.renderFile('templates/addLocal.pug');
      res.status(200).send(result);
   }
})

//GET DATA

app.get('/logout', function(req,res) {
   console.log(req.session)
   req.session.sessionType = 'offline';
   req.session.userId = '';
   console.log(req.session)
   console.log("Właśnie się wylogowałeś, aplikacja działa w trybie offline");
   result = pug.renderFile('templates/documentation.pug');
   res.status(200).send(result);
})

app.get('/getallbooks', function(req, res) {
   if(req.session.sessionType === "online"){
      // online
      var cursor = mongobase.collection('books').find().toArray(function(err, db_results) {
         if (err) return console.log(err);
         console.log(db_results);
         toDisplay = []
         for(let book of db_results){
            let el = {
               tytuł: book.title,
               autor: book.author,
               przeczytana: book.done
            }
            toDisplay.push(el)
         }
         result = pug.renderFile('templates/allbooks.pug', {toDisplay});
         res.status(200).send(result);
      })
   } else {
      result = pug.renderFile('templates/unauthorized.pug');
      res.status(200).send(result);
   }
})

app.get('/getmybooks', function(req, res) {
  if(req.session.sessionType === "online"){
     // online
     var cursor = mongobase.collection('books').find({user: req.session.userId}).toArray(function(err, db_results) {
        if (err) return console.log(err);
        console.log(db_results);
        //result = pug.renderFile('templates/allbooks.pug', {db_results});
        toDisplay = []
         for(let book of db_results){
            let el = {
               tytuł: book.title,
               autor: book.author,
               przeczytana: book.done
            }
            toDisplay.push(el)
         }
         result = pug.renderFile('templates/allbooks.pug', {toDisplay});
        res.status(200).send(result);
     })
  } else {
   result = pug.renderFile('templates/unauthorized.pug');
   res.status(200).send(result);
  }
})

app.get('/getmystats', function(req, res) {
  if(req.session.sessionType === "online"){
     // online
     var cursor = mongobase.collection('books').find({user: req.session.userId}).toArray(function(err, db_results) {
        if (err) return console.log(err);
        console.log(db_results);
        res.status(200).send(db_results);
     })
  } else {
   result = pug.renderFile('templates/unauthorized.pug');
   res.status(200).send(result);
  }
})

//POST DATA
 
app.post('/login', function(req,res) {
    console.log(req.body);
    console.log(req.session)
    if (!req.body.login || !req.body.pass) {
      res.status(401).send("nie udało się zalogować - sprawdź poprawność danych i upewnij się że nie pominąłeś żadnego pola");
    } else{ 
      // connect to server database
      mongodb.MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
         if (err) 
            return console.log(err)

         mongobase = client.db(dbname);
         console.log('Połączono z bazą');
         var session = req.session;

         var cursor = mongobase.collection('user').findOne({login: req.body.login}, function(err, db_results) {
            if (err) 
               return console.log(err);

            if(db_results){
               if(req.body.pass === db_results.pass){
                  session.sessionType = 'online'
                  session.userId = db_results._id;
                  console.log(session)
                  res.status(200).send("Wszystko działa jak trzeba, zalogowałeś się na swoje konto i połączyłeś z bazą!");
               }else{
                  session.userId = '';
                  session.sessionType = 'offline'
                  res.status(401).send("Połączyliśmy się z bazą, ale nie udało nam się ciebie w niej znaleźć... sprawdź poprawność wprowadzonych danych!");
               }
            }else{
               res.status(401).send("Takiego użytkownika nie ma w bazie - sprawdź poprawność danych lub załuż konto");
               session.sessionType = 'offline'
            }
            
         })
       });
      }
 })

 app.post('/register', function(req,res) {
   console.log(req.body);
   if (!req.body.login || !req.body.pass) {
     res.status(401).send("nie można założyć konta, brakuje wartości w jednym lub więcej pól");
   }else{ 
     // connect to server database
     mongodb.MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
        if (err) 
           return console.log(err)

        mongobase = client.db(dbname);
        console.log('Połączono z bazą');
        var session = req.session;

        var cursor = mongobase.collection('user').findOne({login: req.body.login}, function(err, db_results) {
           if (err) 
              return console.log(err);
            console.log("result: ", db_results)
           if(db_results){
              res.status(401).send("Nie udało się założyć konta, użykownik o takiej nazwie użytkownika już istnieje! Jeśli to ty, zaloguj się przez fromularz logowania");
              session.userId = '';
              session.sessionType = 'offline'
           }else{
               mongobase.collection('user').insertOne(req.body,function(err,result) {
                  if (err) return console.log(err);
                  console.log('Użytkownik dodany do bazy');
                  console.log(req.session)
                  res.end('{"inserted record":"' + result.insertedCount + '"}');
               })
              res.status(200).send("Założyłeś nowe konto! Teraz możesz się zalogować");
           } 
        })
      });
     }
})

 app.post('/addbook', function( req,res ) {
    console.log('req.body: ', req.body);
    if(req.session.sessionType === "online"){
       // online
       req.body.user = req.session.userId;
       console.log(req.body);
       mongobase.collection('books').insertOne(req.body,function(err,result) {
          if (err) return console.log(err);
          console.log('Rekord dodany do bazy');
          res.end('{"inserted record":"' + result.insertedCount + '"}');
       })
    } else{
       // offline
       res.status(401).send("Zaloguj się aby to wysłać.");
    }
 })
