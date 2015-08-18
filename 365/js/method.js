
Thoughts = new Mongo.Collection("Thoughts");
Friends = new Mongo.Collection("Friends");
RankRecord = new Mongo.Collection("RankRecord");
SavedPosts = new Mongo.Collection("SavedPosts");

Meteor.methods({

    addThought: function (text, location) {
        // Make sure the user is logged in before inserting a thought
        if(!UserLoggedIn) return false;
        var newThought = {
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            rank: 0,
            username: Meteor.user().username,
            position: location
        };
        Thoughts.insert(newThought);
        return newThought;
    },
    //specifically for adding facebook posts
    addPost: function(post){
        if(!UserLoggedIn) return false
        var thoughtId;
        var text = post["message"];
        var postString = JSON.stringify(post);
        Thoughts.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            rank: 0,
            username: Meteor.user().username,
            postString: postString,
            position: null  }, function(err,thoughtInserted){
            thoughtId = thoughtInserted
        });
        return thoughtId
    },
    changeRank: function(thoughtId, action){
        if(!UserLoggedIn) return false
        RankRecord.find({thoughtId: thoughtId}, {UserId:Meteor.userId()})
    },
    deleteThought: function (thoughtId) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.private && thought.owner !== Meteor.userId()) {
            // If the thought is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.remove(thoughtId);
    },
    addToMyCollection: function(thoughtId){
        console.log(thoughtId);
    },
    changePrivacy: function (thoughtId, setChecked) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.private && thought.owner !== Meteor.userId()) {
            // If the thought is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { checked: setChecked} });
    },
    setPrivate: function (thoughtId, setToPrivate) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        // Make sure only the thought owner can make a thought private
        if (thought.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { private: setToPrivate } });
    },

    //get username
    getUserName: function(){
        return Meteor.user().username;
    },
    getFBUserData: function() {
            console.log("here");
            var fb = new Facebook(Meteor.user().services.facebook.accessToken);
            var data = fb.getUserData();
            return data;
        },
        getFBPostData: function() {
            var fb = new Facebook(Meteor.user().services.facebook.accessToken);
            var data = fb.getPostData();
            return data;
        },
        isFBSession: function(){
            var fb = new Facebook(Meteor.user().services.facebook.accessToken);
            if (fb){
                return true;
            }
            else{
                return false;
            }
        }
});

//facebook type
    function Facebook(accessToken) {
        this.fb = Meteor.require('fbgraph');
        this.accessToken = accessToken;
        this.fb.setAccessToken(this.accessToken);
        this.options = {
            timeout: 3000,
            pool: {maxSockets: Infinity},
            headers: {connection: "keep-alive"}
        }
        this.fb.setOptions(this.options);
    }
    Facebook.prototype.query = function(query, method) {
        var self = this;
        var method = (typeof method === 'undefined') ? 'get' : method;
        var data = Meteor.sync(function(done) {
            self.fb[method](query, function(err, res) {
                done(null, res);
            });
        });
        return data.result;
    }
    Facebook.prototype.getUserData = function() {
        console.log("here");
        return this.query('me');
    }
    Facebook.prototype.getPostData = function() {
        return this.query('/me/feed?limit=5');
    }

function UserLoggedIn() {
    if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
    }
    return false;
}