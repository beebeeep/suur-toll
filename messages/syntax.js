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
  return matched
}

function smartSplit(sep, str, fill) {
    tokens = str.split(sep);
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
        }
    }
    return intent
}

function recognizer(context, done) {
    var intent = { score: 0.0 };
    var tokens = smartSplit(/\s+/, context.message.text, ' ')
    for (var i = 0; i < commands.length; i++) {
        var match = matchIntent(commands[i], tokens);
        if (match) {
            intent = {score: 1.0, intent: commands[i].intent, entities: match};
            break;
        }
    }
    done(null, intent);
}