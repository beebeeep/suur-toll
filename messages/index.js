"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var syntax = require('./syntax')
var bot = require('./bot');

var connector; 
var azure;
switch(process.env.NODE_ENV) {
    case 'development':
        connector = new builder.ChatConnector();
        azure = false;
        break; 
    case 'testing':
        connector = new builder.ChatConnector({
            appId: process.env['AppId'],
            appPassword: process.env['AppPassword']});
        azure = false;
        break;
    default:
        connector = new botbuilder_azure.BotServiceConnector({
            appId: process.env['MicrosoftAppId'],
            appPassword: process.env['MicrosoftAppPassword'],
            stateEndpoint: process.env['BotStateEndpoint'],
            openIdMetadata: process.env['BotOpenIdMetadata']
        });
        azure = true;
}

var chatbot = new builder.UniversalBot(connector, function(session) {
    session.send("Unknown command");
});

chatbot.recognizer({
    recognize: syntax.recognizer
});

bot.setupDialogs(chatbot);

if (!azure) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('Started bot at endpont http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
