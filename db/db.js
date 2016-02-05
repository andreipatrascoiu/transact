"use strict";

/**
 * @module db
 * @requires debug
 * @requires mongodb.MongoClient
 */
 
 var debug = require("debug")("Transact:db");
    var mongoClient = require('mongodb').MongoClient;
    var ids = {};
    
    var dbConnection;
    
/**
 * Retrieve user data from database
 * @param {string} username app username
 * @param {function(boolean, object)} callback success+user/fail
 */
    
function getUserFunc(username, callback) {
    var collection = dbConnection.collection('users');
    collection.findOne({username:{$eq:username}}, function(err, user) {
        if (err) {
            debug(err);
            callback(false);
            return;
        } else {
            callback(true, user);
        }
    });
}
      
/**
 * Register new user; add to database
 * @param {object} user user data from register form
 * @param {function(boolean)} callback success/fail
 */      
function registerFunc(user, callback) {
    var collection = dbConnection.collection('users');
    collection.insert(user, {'w':1}, function (err, result) {
        if (err) {
            debug(err);
            callback(false, "User exists");
        }
        callback(true);
    });
}

/**
 * Add an offer to database
 * @param {string} username owner who adds offer
 * @param {string} name offer name
 * @param {string} description offer description
 * @param {int} price item price
 * @param {string} category item category
 * @param {int} position
 * @param {array} dates delivery dates
 * @param {function(boolean)} callback
 */

function addOfferFunc(username, name, description, price, category, position, dates, callback) {
    var collection = dbConnection.collection('offers');
    var offer = {'id':ids[category], 'username': username, 'name': name, 'description': description, 'price': price,
        'position': position, 'dates': dates
    };
    ids[category] = ids[category] + 1;
    debug(offer);
    debug(category);
    collection.update({"category": category}, {$inc: { 'id': 1, 'count': 1}, $push: {offers: offer}}, function (err, result) {
        if (err) {
            debug(err);
            callback(false, "Error");
        } else {
            callback(true);
        }
            
    });
}

/**
 * Retrieve offers list from database
 * @param {string} category
 * @param {int} from starting index
 * @param {int} numOffers number of offers
 * @param {function(boolean, array, int)} callback
 */
function getOffersFunc(category, from, numOffers, callback) {
    var collection = dbConnection.collection('offers');
    collection.findOne({'category':category}, {offers: {$slice: [from, numOffers]}},
        function(err, offers) {
            if (err) {
                callback(false);
            } else {
                callback(true, offers.offers, offers.count);
            }
        });
}

/**
 * Retrieve an offer from database
 * @param {string} category
 * @param {int} id
 * @param {function(boolean)} callback
 */
function getOfferFunc(category, id, callback) {
    var collection = dbConnection.collection('offers');
    collection.findOne(
        {"category": category}, 
        {offers: {$elemMatch: {'id': id}}}, function (err, offer) {
            if (offer && offer.offers) {
                callback(true, offer.offers[0]);
            } else {
                debug(err);
                callback(false);
            }
        });
}

/**
 * Remove an offer from database
 * @param {string} category
 * @param {int} id
 * @param {function(boolean)} callback
 */
function removeOfferFunc(category, id, callback) {
    var collection = dbConnection.collection('offers');
    debug("removing " + category + " " + id);
    collection.update(
        {"category": category}, 
        {$inc: { 'id': 1, 'count': -1}, $pull: {'offers': {'id': id}}}, function (err) {
            if (!err) {
                callback(true);
            } else {
                debug(err);
                callback(false);
            }
        });
}

/**
 * MongoDB Database startup
 * @param {object} options
 * @param {object} imports
 * @param {function} register
 */

function startup(options, imports, register) {

    
    mongoClient.connect("mongodb://localhost:27017/transactDb", function(err, db) {
      if(!err) {
        dbConnection = db;
        var collection = dbConnection.collection('offers');
        collection.findOne({category:{$eq:'electronics'}}, function(err, offers) {
            ids['electronics'] = offers.id;
        });
        collection.findOne({category:{$eq:'clothes'}}, function(err, offers) {
            ids['clothes'] = offers.id;
        });
        collection.findOne({category:{$eq:'other'}}, function(err, offers) {
            ids['other'] = offers.id;
        });
      }
    });
    
    register(null, {
    
        db: {
            getUser: getUserFunc,
          
            register: registerFunc,
            
            addOffer: addOfferFunc,
            
            getOffers: getOffersFunc,
            
            getOffer: getOfferFunc,
            
            removeOffer: removeOfferFunc
        }
    });
    
}
module.exports = startup;