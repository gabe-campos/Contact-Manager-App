const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const port = 9001;
http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  if (q.pathname === '/') {
    indexPage(req, res);
  }
  else if (q.pathname === '/index.html') {
    indexPage(req, res);
  }
  else if (q.pathname === '/MyContacts.html'){
    contactsPage(req, res);
  }
  else if (q.pathname === '/AddContact.html'){
    addContactPage(req, res);
  }
  else if(q.pathname === '/getContacts'){
    var fields = req.url.split('=');
    var category = fields[1];

    getContacts(req, res, category);
  }
  else if(q.pathname === '/postContactEntry') { 
    var reqBody = ''; 
    // server starts receiving the form data 
    req.on('data', function(data) { 
      reqBody += data; 

    });  
    // server has received all the form data 
    req.on('end', function() { 
      // code to add info in reqBody to file contacts.json 
      // (may want function that take req, res, reqBody)
      addContact(req, res, reqBody);
    }); 
  }
  else{
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end("404 Not Found");
  }
}).listen(port);

// fetch JSON data from contacts.json and return to MyContacts.html
function getContacts(req, res, category){
  var contactsInfo = require('./contacts.json');
  // grab js object at correct category
  var obj = contactsInfo[category];
  // turn into JSON string
  var jsonString = JSON.stringify(obj);
  // send back to MyContacts.html
  res.statusCode = 200;
  res.setHeader('Content-type', 'application/json');
  res.write(jsonString);
  res.end();
}

function addContact(req, res, reqBody){
  // Get all the values – name, category, location, contact, email, website_name, website_url 
  var postObj = qs.parse(reqBody); 
  var name = postObj.name; 
  var category = postObj.category.toLowerCase(); 
  var location = postObj.location; 
  var info = postObj.info;
  var email = postObj.email;
  var website_title = postObj.website_title;
  var url = postObj.url; 
  //Next, stick the values in a new json  “Contact object” that is the same as the objects stored in contacts.json arrays in each category 
  var newjsonObj= {}; 
  newjsonObj["name"] = name; 
  newjsonObj["location"] = location; 
  newjsonObj["info"] = info;
  newjsonObj["email"] = email;    
  newjsonObj["website_title"] = website_title;
  newjsonObj["url"] = url; 

  //Read in the contacts.json file
  var JsonObj = require('./contacts.json');
  
  //Get the array from the proper category
  ObjArray = JsonObj[category]; 

  //next, append newjsonObj onto end of array  
  ObjArray.push(newjsonObj);
  
  //stringify JsonObject (store in fileJsonString) 
  fileJsonString = JSON.stringify(JsonObj);
  
  //add the new information to contacts.json
  fs.writeFile('./contacts.json', fileJsonString, function(err){
    if(err){
      throw err;
    }
  })
  //set the Content-type to application/json 
  //redirect to MyConacts.html
  res.writeHead(302,{ 
            'Location':'MyContacts.html' ,
            'Content-Type':'application/json'
  }); 
  res.end(); 
}

function addContactPage(req, res){
  fs.readFile('client/AddContact.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function indexPage(req, res) {
  fs.readFile('client/index.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}

function contactsPage(req, res){
  fs.readFile('client/MyContacts.html', function(err, html) {
    if(err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}
