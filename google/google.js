"use strict";
/**
 * @module google
 * @requires debug
 * @requires googleapis
 * @requires jsonwebtoken
 * @requires moment
 */

var clientID = "140375088670-2kmj0ef23o2udtlqrnq3vcfu4c00b57g.apps.googleusercontent.com";
var clientSecret = "Nn0akJZzE96RYXWi-Myr6uU4";
var redirectUrl = "https://transact-andreipatrascoiu.c9users.io/login1";

var debug = require("debug")("Transact:google");
var googleapis = require("googleapis");
var jwt = require('jsonwebtoken');
var moment = require('moment');

var OAuth2 = googleapis.auth.OAuth2;
var oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);

/** 
 * Google Calendar Authentication
 * @param user {string} google user
 */

function getAuthFunc(user) {
    var oauth2Client = new OAuth2(clientID, clientSecret, redirectUrl);
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        state: user
    });
}

/**
 * Get authentication token
 * @param code {string}
 * @param callback {function(boolean)}
 * @private
 */

function getTokenFunc(code, callback) {
    oauth2Client.getToken(code, function(err, tokens) {
        if (!err) {
            var id = jwt.decode(tokens.id_token);
            delete tokens.id_token;
            callback(true, tokens, id.email);
        } else {
            callback(false);
        }
    });
}

/**
 * Create event in users' calendars (for delivery)
 * @param tokens {object}
 * @param email1 {string}
 * @param email2 {string}
 * @param date {date}
 * @param position {object}
 * @param offerName {string}
 */

function createEventFunc(tokens, email1, email2, date, position, offerName) {
    var authClient = new OAuth2(clientID, clientSecret, redirectUrl);
    authClient.credentials = tokens;

    var dateFormat = 'YYYY-MM-DDTHH:mm:ss+02:00';

    var startDate = moment(date).format(dateFormat);
    var endDate = moment(date).add('minutes', 15).format(dateFormat);
    debug(startDate);
    debug(endDate);

    var calendar = googleapis.calendar('v3');
    var event = {
        'summary': "Transact purchase: " + offerName,
        'description': 'Transaction for product',
        'location': position.lat + " " + position.lng,
        'start': {
            'dateTime': startDate,
            'timeZone': 'Europe/Bucharest',
        },
        'end': {
            'dateTime': endDate,
            'timeZone': 'Europe/Bucharest',
        },
        'attendees': [{
            'email': email1
        }, {
            'email': email2
        }]
    };

    calendar.events.insert({
        auth: authClient,
        calendarId: 'primary',
        resource: event,
    }, function(err, event) {
        if (err) {
            debug('There was an error contacting the Calendar service: ' + err);
            return;
        }
    });
}

/**
 * Google API startup (integrates Google Maps, Mail and Calendar)
 * @param options
 * @param imports
 * @param register
 */

function startup(options, imports, register) {

    register(null, {

        google: {
            getAuthorization: getAuthFunc,

            getToken: getTokenFunc,

            createEvent: createEventFunc
        }
    });
}

module.exports = startup;
