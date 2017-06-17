"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var syntax = require('./syntax')

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector, function(session) {
    session.send("Unknown command");
});

bot.recognizer({
    recognize: syntax.recognizer
});

bot.dialog('CreateBauTask', function(session, args, next) {
    console.log('Session is ', session)
    console.log('args is ', args)
    session.send('bau task -> ' + JSON.stringify(args));
}).triggerAction({matches: 'CreateBauTask'});



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
