striptags = require('striptags');
process = require('process');
settings = require('./settings');

module.exports = {
    recognizer: recognizer
}
/* Recognizer works as follows:
1. Sentence is splitted into tokens by spaces (quotes are supported while tokenizing),
2. Intent is constructed by comparing tokens with intents array.
   Comparsion is done element by element while collection intent entities following rules:
   * 'word' -> {word: 'word'}
   * '$keyName' -> {keyName: <value of corresponding token>}
   * 'word?' -> {word: 'word} (optional, can be missing)
   * '$keyName?' -> {keyName: <value of corresponding token>} (optional, can be missing)
*/

var commands = [
    {intent: 'Authenticate',    syntax: ['authenticate']},
    {intent: 'Authenticate',    syntax: ['auth']},
    {intent: 'Say',             syntax: ['say', '$text']},
    {intent: 'Set',             syntax: ['set', '$variable', 'to', '$value']},
    {intent: 'UserSet',         syntax: ['userset', '$variable', 'to', '$value']},
    {intent: 'Get',             syntax: ['get', '$variable']},
    {intent: 'Dump',            syntax: ['dump']},
    {intent: 'CreateBauTask',   syntax: ['bau', 'task', '$title', '$description?']},
    {intent: 'CreateTask',      syntax: ['task', '$title', '$description?']},
    {intent: 'AssignTask',      syntax: ['assign', '$item', 'to', '$person', 'with?', 'comment', '$comment']},
    {intent: 'UnassignTask',    syntax: ['unassign', '$item', 'with?', 'comment', '$comment']},
    {intent: 'AddTag',          syntax: ['add', 'tag', '$tag', 'to', '$item', 'with', 'comment', '$comment']},
    {intent: 'CommentTask',     syntax: ['comment', '$item', '$comment']},
    {intent: 'LinkTask',        syntax: ['link', '$srcItem', 'to', '$tgtItem', 'as', '$relation']},
    {intent: 'CloseTask',       syntax: ['close', '$item', 'with?', 'comment', '$comment']},
    {intent: 'ResolveTask',     syntax: ['resolve', '$item', 'with?', 'comment', '$comment']},
    {intent: 'ProgressTask',    syntax: ['progress', '$item', 'with?', 'comment', '$comment']},
    {intent: 'BlockTask',       syntax: ['block', '$item', 'with?', 'comment', '$comment']},
    {intent: 'OpenTask',        syntax: ['open', '$item', 'with?', 'comment', '$comment']}
];

var activation_re = new RegExp('^(?:Edited previous message:\\s+)?@?' + process.env.BotName + '\\s*');

function countSym(str, sym) {
  var count = 0;
  var pos = str.indexOf(sym);
  while (pos !== -1) {
    count++;
    pos = str.indexOf(sym, pos + 1);
  }
  return count; 
}

function unmatchedQuotes(str) {
  var quotes = ["'", '"', '`', '“'];
  var matched = true;
  for (i = 0; i < quotes.length; i++) {
    matched = matched && (countSym(str, quotes[i]) % 2 === 0);
  }
  return !matched
}

function smartSplit(sep, str, fill) {
    // actually, not-so-smart-split: will split 'str' by regex 'sep', considering possible quotes etc
    // note that in quoted tokens substring matching 'sep' will be replaced with 'fill' string
    var tokens = str.split(sep);
    var i = 1;
    while (true) {
      if (unmatchedQuotes(tokens[i-1])) {
        token = tokens.splice(i,1)
        tokens[i-1] += fill + token;
      } else {
          i++;
      }
      if (i >= tokens.length) {
        break;
      }
    }
    for (var i = 0; i < tokens.length; i++) {
        // unquote token
        tokens[i] = tokens[i].replace(/^(['"“])(.*)\1$/, "$2");
    }
    return tokens
}


function matchIntent(syn, tokens) {
    var intent = {};
    var syntax = syn.syntax;
    for (var i = 0; i < syntax.length; i++) {
        var synToken = syntax[i];
        if (synToken[0] === '$') {
            if (tokens[i] || synToken.slice(-1) === '?') {
                intent[synToken.replace(/^\$/, '').replace(/\?$/, '')] = tokens[i]; 
            } else {
                return null
            }
        } else if (tokens[i] === synToken) {
                intent[synToken] = synToken;
        } else if (!tokens[i]) {
            if (synToken.slice(-1) === '?') {
                return intent
            } else {
                return null
            }
        } else {
            return null;
        }
    }
    return intent
}

function recognizer(context, done) {
    console.log("Got message '%s' from %j", context.message.text, context.message.address);
    var intent = { score: 1.0, intent: 'ExecuteCommands', entities: {commands: []} };
    var text = striptags(context.message.text).replace(activation_re, '');
    var commandTokens = smartSplit(/\s*;\s*/, text, ' ; ');
    // cycle through all semicolon-separated commands
    commandTokens.forEach( cmdToken => {
        var tokens = smartSplit(/\s+/, cmdToken, ' ')
        var cmd  = {type: 'UnknownCommand'};
        // try to find known command
        for (var i = 0; i < commands.length; i++) {
            var match = matchIntent(commands[i], tokens);
            if (match) {
                cmd = {type: commands[i].intent, opts: match};
                break;
            }
        }
        intent.entities.commands.push(cmd);
    });

    done(null, intent);
}
