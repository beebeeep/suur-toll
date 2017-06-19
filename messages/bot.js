"use strict";
var vso = require('./vso');

module.exports = {
    setupDialogs: setupDialogs
}

function setupDialogs(bot) {
    bot.dialog('ExecuteCommands', (session, args, next) => {
        args.intent.entities.commands.forEach( command => {
            var opts = command.opts;
            switch (command.type) {
                case 'Say':
                    session.send(opts.text);
                    break;
                case 'Set':
                    var prev = session.conversationData[opts.variable];
                    session.conversationData[opts.variable] = opts.value;
                    session.send("New value saved. Previous was " + prev);
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
        });
    }).triggerAction({matches: 'ExecuteCommands'});
}
