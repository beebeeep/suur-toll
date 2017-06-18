"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var syntax = require('./syntax')
var vso = require('./vso');

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

var bot = new builder.UniversalBot(connector, function(session) {
    session.send("Unknown command");
});

bot.recognizer({
    recognize: syntax.recognizer
});

bot.dialog('CreateBauTask', (session, args, next) => {
    session.send('bau task -> ' + JSON.stringify(args));
}).triggerAction({matches: 'CreateBauTask'});


bot.dialog('ExecuteCommands', (session, args, next) => {
    args.intent.entities.commands.forEach( command => {
        var opts = command.opts;
        switch (command.type) {
            case 'CommentTask':
                vso.commentTask(opts.item, opts.comment).then((wit) => {
                    session.send("Comment was added to item #" + wit.id);
                }).catch((err) => {
                    session.send("Cannot comment item: " + err);
                });
                break;
            default:
                session.send("Unknown command");
        }
    });
}).triggerAction({matches: 'ExecuteCommands'});

if (!azure) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
