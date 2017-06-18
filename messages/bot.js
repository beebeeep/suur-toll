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
}
