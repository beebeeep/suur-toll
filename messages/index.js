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
var tableName = 'suurtolldata';
var storageAccount = 'ecombotstorage';
var accountKey = process.env.StorageKey;
var tableClient = new botbuilder_azure.AzureTableClient(tableName, storageAccount, accountKey);
var storage = new botbuilder_azure.AzureBotStorage({gzipData: false}, tableClient);

var chatbot = new builder.UniversalBot(connector, function(session) {
    session.send("Unknown command");
});
chatbot.set('storage', storage);
chatbot.set('persistConversationData', true);
//chatbot.set('autoBatchDelay', 1000);
chatbot.recognizer({
    recognize: syntax.recognizer
});

bot.setupDialogs(chatbot);

if (!azure) {
    var restify = require('restify');
    var restify_plugins = require('restify-plugins');
    var server = restify.createServer();
    server.use(restify_plugins.queryParser());
    server.listen(3978, function() {
        console.log('Started bot at endpont http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
    server.get('/api/oauth', bot.oauthHandler(chatbot));    
} else {
    module.exports = { default: connector.listen() }
}
