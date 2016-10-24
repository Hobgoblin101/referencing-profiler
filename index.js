var database =  require("referencing-database");
var crypto = require('crypto');
var fs = require('fs');

var defualtUser = {
  username: "username",
  password: {
    salt: "salt",
    hash: "hash"
  },
  displayname: "displayname",
  privilege: {
    name: "user",
    custom: {
      createChat: false,
      createPost: false,
      admin: false
    }
  }
};


//Setup profile defualts
if (typeof(fs.readdirSync("./database/")) == "object"){
    var folderData = fs.readdirSync("./database/templates");
    if (typeof(folderData) == "object"){
      //Dose profile template exist?
      if (folderData.indexOf("profile") == -1){
        fs.writeFileSync("./database/templates/profile.json", JSON.stringify(defualtUser, null, 2));
      }else{
        defualtUser = JSON.parse(fs.readFileSync("./database/templates/profile.json", 'utf8'));
      }
    }else{
      console.log("***Error***: Database/templates are non-existent");
    }
}else{
  console.log("***Error***: Database is non-existent");
}

module.exports = {
  login: function(username, password){

    //Remove special characters
    username = username.replace(/[!@#$%^&*]/g, '');

    //Check is username, password, and profile exist and are valid
    if (!username || !password){
      return {valid: false, err: "invalid login"};
    }
    if (!database.exist("profile", username)) {
      return {valid: false, err: "non-existent user"};
    }

    //Load userData
    var userData = database.get("profile", username);

    if (typeof(userData.password) == "object"){
      if (typeof(userData.password.salt) != "string" || typeof(userData.password.hash) != "string"){
        return {valid: false, err: "invalid login"};
      }
    }else{
      return {valid: false, err: "invalid login"};
    }

    //Encrypt input password, based of users salt
    var hash = crypto.pbkdf2Sync(password, userData.password.salt, 10000, 512, 'sha512');

    //Check if both Encrypted passwords are the same
    if (userData.password.hash.toString() === hash.toString()) {
      return {valid: true, err: null, username: username};
    }else{
      return {valid: false, err: "invalid login", username: username};
    }

  },
  new: function(username, password){

    //Remove special characters
    username = username.replace(/[!@#$%^&*]/g, '');

    //Check is username, password, and profile are valid and don't exist
    if (!username || !password || database.exist("profile", username)) {
      return false;
    }

    //Create password Encryption
    var salt = crypto.randomBytes(128).toString('base64');
    var hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512');

    //Save data to a new profile
    var newUser = database.new("profile", username);
    if (newUser.successful){
      database.set("profile", username, {username: username, password: {salt: salt, hash: hash.toString()}});
    }

    //return if process was successful
    return newUser;
  },
  get: function(id){
    if (database.exist('profile', id)){
      var data = {};
      data = database.get("profile", id);
      data.password = "protected";
      return data;
    }else{
      return null;
    }
  },
  set: function(user, newData){
    return database.set("profile", user, newData);
  }
};
