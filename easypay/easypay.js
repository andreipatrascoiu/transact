"use strict";
/**
 * @module easypay
 * @requires http
 * @requires debug
 * @requires querystring
 */
 
  var http = require('http');
    var querystring = require('querystring');
    var easyPayUrl = "easypay-andreeab6.c9users.io";
    
    var debug = require("debug")("Transact:easypay");
 
 
  /**
   * Funtion to register Transact account with EasyPay accounts
   * @param easyPayUser {string}
   * @param easyPayAccount {string}
   * @param callback {function(boolean)}
   */   
    
function registerFunc(easyPayUser, easyPayAccount, callback) {

            var postOptions = {
                host: easyPayUrl,
                port: '8081',
                path: '/Prj/TransactApi?username=' + easyPayUser + '&accountid=' + easyPayAccount,
                method: 'POST'
            };

            // Set up the request
            var postReq = http.request(postOptions, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    debug('Response: ' + chunk);
                    if (chunk == 'true') {
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            });

            // post the data
            postReq.on('error', function(e) {
                debug('There was a problem with the request: ' + e.message);
                callback(false);
            });
            
            postReq.write("");
            postReq.end();
        }
            
    /**
   * Funtion to transfer money between EasyPay accounts
   * @param sourceAccount {string}
   * @param destAccount {string}
   * @param sum {int}
   * @param callback {function(boolean)}
   */
            
function transferFunc(sourceAccount, destAccount, sum, callback) {

    var postOptions = {
        host: easyPayUrl,
        port: '8081',
        path: '/Prj/TransactApi?source=' + sourceAccount + '&dest=' + destAccount + '&sum=' + sum,
        body: {"source": sourceAccount, "dest": destAccount, "sum": sum},
        method: 'POST'
    };

    // Set up the request
    var postReq = http.request(postOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'true') {
                callback(true);
            } else {
                callback(false);
            }
        });
    });

    // post the data
    postReq.on('error', function(e) {
        debug('There was a problem with the request: ' + e.message);
        callback(false);
    });
    
    postReq.write("");
    postReq.end();
}

/** EasyPay startup
 * @param options
 * @param imports
 * @param register
 */

function startup(options, imports, register) {
    
    register(null, {
    
        easypay: {
            
            register: registerFunc,
            
            transfer: transferFunc
        }
    });
}

module.exports = startup;