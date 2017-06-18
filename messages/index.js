"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var syntax = require('./syntax')
var vso = require('./vso');

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

bot.dialog('CreateBauTask', (session, args, next) => {
    session.send('bau task -> ' + JSON.stringify(args));
}).triggerAction({matches: 'CreateBauTask'});


bot.dialog('CommentTask', (session, args, next) => {
    var opts = args.intent.entities;
    vso.commentItem(opts.item, opts.comment).then( (wit) => {
        console.log(wit);
        session.send("Comment was added to item #" + wit.id);
    }).catch ( (err) => {
        session.send("Cannot comment item: " + err);
    });
}).triggerAction({matches: 'CommentTask'});

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
