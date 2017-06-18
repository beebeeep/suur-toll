var process = require('process');
var vsts = require('vso-node-api');
var collectionUrl = "https://skype-test2.visualstudio.com/defaultcollection";
var token = process.env.VSOToken;
var authHandler = vsts.getPersonalAccessTokenHandler(token);
var witApi = new vsts.WebApi(collectionUrl, authHandler).getWorkItemTrackingApi();

module.exports = {
    commentTask: commentTask
}

function commentTask(id, text) {
    return new Promise( (resolve, reject) => {
        var patch = [ {op: 'add', path: '/fields/System.History', value: text} ];
        witApi.updateWorkItem({}, patch, id)
            .then( wit => { resolve(wit); })
            .catch( err => { reject(err); });
    });
}
