"use strict";
var util = require('util');
var builder = require("botbuilder");
var vso = require('./vso');

module.exports = {
    setupDialogs: setupDialogs
}

function setupDialogs(bot) {
    bot.dialog('ExecuteCommands', (session, args, next) => {
        var commands = args.intent.entities.commands;
        for (var i = 0; i < commands.length; i++) { 
            var command = commands[i];
            if (command.type === 'Authenticate') {
                var msg = new builder.Message(session);
                msg.attachments([
                    new builder.SigninCard(session).button('ok', 'https://miga.me.uk').text('jump da fuck up')
                ]);
                session.send(msg);
                break;
            }
            if (!session.userData.auth) {
                session.send("Sorry, I don't know you. Use command 'authenticate' first");
                break;
            }
            var opts = command.opts;
            switch (command.type) {
                case 'Say':
                    session.send(opts.text);
                    break;
                case 'UserSet':
                    var prev = session.userData[opts.variable];
                    session.userData[opts.variable] = opts.value;
                    session.send(util.format("New value for '%s' saved. Previous was %s", opts.variable, prev));
                    break
                case 'Set':
                    var prev = session.conversationData[opts.variable];
                    session.conversationData[opts.variable] = opts.value;
                    session.send(util.format("New value for '%s' saved. Previous was %s", opts.variable, prev));
                    break
                case 'Get':
                    var v = session.conversationData[opts.variable];
                    session.send(opts.variable + ' = ' + v);
                    break;
                case 'Dump':
                    console.log(JSON.stringify(session.conversationData));
                    session.send("userData: " + JSON.stringify(session.userData));
                    session.send("conversationData: " + JSON.stringify(session.conversationData));
                    break;
                case 'CommentTask':
                    vso.commentTask(session, opts.item, opts.comment)
                        .then((wit) => { session.send("Comment was added to item #" + wit.id); })
                        .catch((err) => { session.send("Cannot comment item: " + err); });
                    break;
                case 'CreateBauTask':
                    vso.createTask(session, true, opts.title, opts.description)
                        .then((wit) => { session.send("Sure, created task #" + wit.id); })
                        .catch((err) => { session.send("Cannot create task: " + err); });
                    break;
                case 'CreateTask':
                    vso.createTask(session, false, opts.title, opts.description)
                        .then((wit) => { session.send("Sure, created task #" + wit.id); })
                        .catch((err) => { session.send("Cannot create task: " + err); });
                    break;
                case 'AssignTask':
                    vso.AssignTask(session, opts.item, opts.person, opts.comment)
                        .then((wit) => { session.send("Assigned to" + wit.fields['System.AssignedTo']); })
                        .catch((err) => { session.send("Cannot assign task: " + err); });
                    break;
                case 'UnassignTask':
                    vso.AssignTask(session, opts.item, null, opts.comment)
                        .then((wit) => { session.send("Ok, unassigned"); })
                        .catch((err) => { session.send("Cannot unassign task: " + err); });
                    break;
                default:
                    session.send("Unknown command");
            }
        }
    }).triggerAction({matches: 'ExecuteCommands'});
}
