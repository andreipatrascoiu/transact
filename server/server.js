"use strict";
/**
 * @module server
 */

function redirectApp(req, resp, next) {
    resp.sendfile(__dirname + '/resources/app.html');
}

function redirectLogin(req, resp, next) {
    resp.sendfile(__dirname + '/resources/login.html');
}

/**
 * Server startup. Initializes DB connection and express. Also contains methods
 * the GET and POST requests of the application
 * @param options
 * @param imports
 * @param register
 */
function startup(options, imports, register) {

    var express = require('express');
    var app = express();
    var path = require('path');

    var debug = require("debug")("Transact:server");

    var db = imports.db;
    var google = imports.google;
    var easyPay = imports.easypay;
    var curier = imports.curier;

    var partialUsers = {};

    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'resources')));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'SECRET',
        cookie: {
            httpOnly: false,
            maxAge: 3600000
        }
    }));

    app.use(function(req, resp, next) {
        if (!req.session.user) {
            req.session.user = {};
        }
        next();
    });

    app.engine('.html', require('ejs').__express);
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');

    /**
     * @function GET / - The main page of the application.
     */
    app.get("/", redirectApp);

    /**
     * @function GET /doc - Returns the documentation of the project.
     */
    app.get('/doc', function(req, resp, next) {
        resp.sendfile(__dirname + 'resources/doc/index.html');
    });

    /**
     * @function GET /login - Returns the login page.
     */
    app.get("/login", redirectLogin);

    /**
     * @function POST /login - Performs the login.
     * Params are sent in the body.
     * @param {string} username
     * @param {string} password
     * @return "OK" if the username and password match or an error description otherwise
     */
    app.post("/login", function(req, resp, next) {
        var username = req.body.user;
        var password = req.body.pass;
        db.getUser(username, function(success, user) {
            if (success && user && user.password === password) {
                req.session.user = user;
                delete req.session.user.password;
                resp.send('OK');
            } else {
                resp.send('Incorrect username or password!');
            }
        });
    });

    /**
     * @function GET /myaccount - Information about the logged in account.
     * @return JSON object with account information
     */
    app.get("/myaccount", function(req, resp, next) {
        resp.json({
            'user': req.session.user
        });
    });

    /**
     * @function GET /offer - Information about a certain offer.
     * @param {string} id offer ID
     * @param {string} category offer category
     * @return JSON object with information about the offer
     */
    app.get("/offer", function(req, resp, next) {
        var category = req.query.category;
        var id = Number(req.query.id);
        debug("Entry: " + req.path + " " + category + " " + id);

        db.getOffer(category, id, function(success, offer, count) {
            if (success) {
                resp.json({
                    'offer': offer
                });
            } else {
                resp.json({
                    'error': 'Offer does not exist!'
                });
            }
        });
    });

    /**
     * @function POST /offers - Return a list of offers.
     * The parameters are in the body.
     * @param {int} from the index of the ordered list of offers from which to start
     * @param {string} category offer category
     * @param {int} numOffers the number of offers to return
     * @return JSON array with the specified number of offers from the category and from the given index and the total number of offers in the given category
     */
    app.post("/offers", function(req, resp, next) {
        var category = req.body.category;
        var from = Number(req.body.from);
        var numOffers = Number(req.body.numOffers);

        db.getOffers(category, from, numOffers, function(success, items, count) {
            if (success) {
                resp.json({
                    'offers': items,
                    'count': count,
                    'index': from,
                    'category': category
                });
            } else {
                resp.json({
                    'error': 'An error has occured!'
                });
            }
        });
    });

    /**
     * @function POST /add - Add a new offer.
     * The parameters are in the body.
     * @param {string} name the name of the offer
     * @param {string} category offer category
     * @param {int} price offer price
     * @param {string} description offer description
     * @param {JSON} position JSON object containing the latitude (lat) and longitude (lng)
     * @param {Array} dates JSON array with available times
     * @return "Offer created" if the operation was successful or an error description otherwise
     */
    app.post("/add", function(req, resp, next) {
        var name = req.body.name;
        var price = req.body.price;
        var description = req.body.description;
        var category = req.body.category;
        var position = req.body.position;
        var dates = req.body.dates;

        if (!req.session.user.username) {
            resp.send("No user logged in!");
            return;
        }

        debug(position);
        debug(dates);

        db.addOffer(req.session.user.username, name, description, price, category, position, dates,
            function(success, error) {
                if (success) {
                    resp.send('Offer created');
                } else {
                    resp.send(error);
                }
            });
    });

    /**
     * @function GET /register - Return the register page.
     */
    app.get("/register", function(req, resp, next) {
        resp.sendfile(__dirname + '/resources/register.html');
    });

    /**
     * @function POST /register - Register a new user.
     * The parameters are in the body.
     * @param {string} user new username
     * @param {string} name user display name
     * @param {strin} pass user password
     * @param {string} easyPayUser EasyPay username
     * @param {string} easyPayAccount EasyPay account number
     * @return "OK" if the operation was successful or an error description otherwise.
     */
    app.post("/register", function(req, resp, next) {
        var username = req.body.user;
        var name = req.body.name;
        var description = req.body.description;
        var pass = req.body.pass;
        var admin = false;
        var easyPayUser = req.body.easyPayUser;
        var easyPayAccount = req.body.easyPayAccount;

        if (!username) {
            resp.send("No username!");
            return;
        }

        if (!name) {
            resp.send("No name!");
            return;
        }

        if (!pass) {
            resp.send("No password!");
            return;
        }

        if (!easyPayUser) {
            resp.send("No EasyPay user!");
            return;
        }

        if (!easyPayAccount) {
            resp.send("No EasyPay account!");
            return;
        }

        easyPay.register(easyPayUser, easyPayAccount, function(success) {

            //if (!success) {
            //resp.send("EasyPay account is invalid!");
            //return;
            //} 

            db.getUser(username, function(success, user) {
                if (success) {
                    if (!user) {
                        var partialUser = {};
                        partialUser['username'] = username;
                        partialUser['name'] = name;
                        partialUser['password'] = pass;
                        partialUser['description'] = description;
                        partialUser['admin'] = admin;
                        partialUser['easyPayAccount'] = easyPayAccount;
                        partialUsers[username] = partialUser;
                        debug(partialUser);
                        resp.send('OK');
                    } else {
                        resp.send("User already exists!");
                    }
                } else {
                    resp.send("An error has occured!");
                }
            });
        });
    });

    /**
     * @function GET /register_google - API must be called after a successful register in order to complete the process.
     * @param {string} user username of the newly created user
     */
    app.get("/register_google", function(req, resp, next) {
        var user = req.query.user;
        var url = google.getAuthorization(user);
        resp.redirect(url);
    });

    /**
     * @function GET /login1 - API called by Google after the user gives permission for the Transact application.
     * @param {string} code Google authorization code
     */
    app.get("/login1", function(req, resp, next) {
        var authorizationCode = req.query.code;

        if (!authorizationCode) {
            resp.render('message', {
                'message': 'Account was not created because Google Calendar permissions have not been granted!'
            });
        } else {
            google.getToken(authorizationCode, function(success, tokens, email) {
                debug(req.query.state);
                debug(tokens);
                debug(email);

                var partialUser = partialUsers[req.query.state];
                if (!partialUser) {
                    resp.render('message', {
                        'message': 'There\'s been a problem with the account creation!'
                    });
                }
                partialUser.tokens = tokens;
                partialUser.email = email;
                delete partialUsers[req.query.state];

                db.register(partialUser, function(success) {
                    if (success) {
                        req.session.user = partialUser;
                        resp.redirect('/');
                    } else {
                        resp.render('message', {
                            'message': 'There\'s been a problem with the account creation!'
                        });
                    }
                });
            });
        }
    });

    /**
     * @function POST /buy - Purchase an offer.
     * The parameters are in the body.
     * @param {string} category offer category
     * @param {int} id offer ID
     * @param {string} date the selected date for the purchase
     * @param {string} offeringUser the user offering the offer
     * @param {string} offerName the name of the offer
     * @param {string} delivery the method of delivery (curier or personal)
     * @return JSON object containing a message with the outcome of the operatio.
     */
    app.post("/buy", function(req, resp, next) {
        var category = req.body.category;
        var id = Number(req.body.id);
        var date = req.body.date;
        var offeringUserName = req.body.offeringUser;
        var offerName = req.body.offerName;
        var user = req.session.user;
        var deliveryMethod = req.body.delivery;

        db.getOffer(category, id, function(success, offer, count) {
            if (!success || !offer) {
                resp.json({
                    'message': 'Offer does not exist!'
                });
                return;
            }

            if (!user.name) {
                resp.json({
                    'message': 'You must be logged in to purchase!'
                });
                return;
            }

            if (offer.username === user.username) {
                resp.json({
                    'message': 'You cannot buy your own offer!'
                });
                return;
            }

            db.getUser(offeringUserName, function(success, offeringUser) {
                if (!success || !offeringUser) {
                    resp.json({
                        'message': 'There\'s been a problem with the purchase!'
                    });
                    return;
                }

                debug("Buy: " + category + " " + id + " " + date);
                easyPay.transfer(user.easyPayAccount, offeringUser.easyPayAccount, Number(offer.price), function(success) {

                    //if (!success) {
                    //resp.json({'message':'Not enough funds to complete the transaction!'});
                    //return;
                    //}

                    debug("Delivery: " + deliveryMethod);

                    if (deliveryMethod == 'personal') {
                        google.createEvent(user.tokens, user.email, offeringUser.email, date, offer.position, offerName);
                        db.removeOffer(category, id, function(success) {
                            if (success) {
                                resp.json({
                                    'message': 'Purchase successful! A notification has been created in Google Calendar!'
                                });
                            } else {
                                resp.json({
                                    'message': 'There\'s been a problem with the purchase!'
                                });
                            }
                        });
                    } else {
                        curier.transfer(id, user.email, offer.position.lat, offer.position.lng, function(success) {
                            db.removeOffer(category, id, function(success) {
                                if (success) {
                                    resp.json({
                                        'message': 'Purchase successful! You will receive an e-mail when the order arrives!'
                                    });
                                } else {
                                    resp.json({
                                        'message': 'There\'s been a problem with the purchase!'
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });

    app.use(function(req, resp) {
        resp.render('message', {
            'message': 'Page not found!'
        });
    });

    app.listen(options.port);
}

module.exports = startup;
