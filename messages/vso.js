var process = require('process');
var vsts = require('vso-node-api');
var collectionUrl = "https://skype-test2.visualstudio.com/defaultcollection";
var token = process.env.VSO_TOKEN;
var authHandler = vsts.getPersonalAccessTokenHandler(token);
var witApi = new vsts.WebApi(collectionUrl, authHandler).getWorkItemTrackingApi();

module.exports = {
    commentItem: commentItem
}

async function commentItem(id, text) {
    try {
        var patch = [ {op: 'add', path: '/fields/System.History', value: text} ];
        var wit = await witApi.updateWorkItem({}, patch, id);
        return wit
    } catch(err) {
        throw err;
    }
}