An addon to [referencing-database](https://www.npmjs.com/package/referencing-database) that makes user profiles easy.  


##profiler.login(username, password)
Will return whether or not it is a valid login.  
_Example: {valid: false, err: "invalid login"};_

##profiler.new(username, password)
Will create a new user based of the profile template with encrypted password  
though crypto's salt and hashing.

##profiler.get(username)
Will return the users data, with the users salt and hash missing

##profiler.set(username, data)
Will merg the current user's data and the new data. With new data overwriting.
