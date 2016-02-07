"use strict";
/**
 /**
  * @module curier
  * @requires http
  * @requires debug
  */
  
  var debug = require("debug")("Transact:curier");
  var http = require('http');
  var curierUrl = "ims-mathplayer.c9users.io";
  
  /**
   * Funtion to transfer a package to the courier
   * @param id {number}
   * @param mail {string}
   * @param lat {double}
   * @param lon {double}
   * @param callback {function(boolean)}
   */
  
  function transferFunc(id, email, lat, lon, callback) {

                var postOptions = {
                    host: curierUrl,
                    port: '8080',
                    path: '/curier/add/?id=' + id + '&mail=' + email + "&lat=" + lat + "&lon=" + lon,
                    body: {"id": id, "mail": email, "lat": lat, "lon": lon},
                    method: 'GET'
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
 
 /** Curier startup
 * @param options
 * @param imports
 * @param register
 */
function startup(options, imports, register) {

    register(null, {
    
        curier: {
            
            transfer: transferFunc
        }
    });
}

module.exports = startup;