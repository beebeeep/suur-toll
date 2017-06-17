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
  for (var i = 0; i < quotes.length; i++) {
    matched = matched && (countSym(str, quotes[i]) % 2 === 0);
  }
  return !matched
}

function dump(arr) {
  for (var i = 0; i < arr.length; i++) {
    //console.log("%s ->\t\t%s\t%s", i, arr[i], unmatchedQuotes(arr[i]));
    console.log("%s ->\t\t%s", i, arr[i]);
  }
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
    for (var i = 0; i < syn.length; i++) {
        var synToken = syn[i];
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


var s  = "assign $last to me with comment 'asd'";
var syn = ['assign', '$item', 'to', '$person', 'with?', 'comment', '$comment'];
var tokens = smartSplit(/\s+/, s, ' ');
var i = matchIntent(syn, tokens);
console.log(i);