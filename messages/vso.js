var process = require('process');
var moment = require('moment-strftime');
var vsts = require('vso-node-api');
var settings = require('./settings');
var collectionUrl = "https://skype-test2.visualstudio.com/defaultcollection";
var token = process.env.VSOToken;
var authHandler = vsts.getPersonalAccessTokenHandler(token);
var witApi = new vsts.WebApi(collectionUrl, authHandler).getWorkItemTrackingApi();

Object.keys(settings.backlogs).forEach( (b) => {
    settings.backlogs[b].iteration = moment().strftime(settings.backlogs[b].iteration);
    witApi.getWorkItem(settings.backlogs[b].bau_epic).then( (wit) => {
        settings.backlogs[b].bau_epic = wit;
    }).catch( (err) => { throw err; });
});

module.exports = {
    commentTask: commentTask,
    createTask: createTask
}

function commentTask(session, id, text) {
    return new Promise( (resolve, reject) => {
        id = getTaskId(session, id);
        if (!id) {
            reject(new Error('Cannot find that task'));
            return;
        }
        var patch = [ {op: 'add', path: '/fields/System.History', value: text} ];
        witApi.updateWorkItem({}, patch, id)
            .then( wit => { resolve(wit); })
            .catch( err => { reject(err); });
    });
}

function createTask(session, bau, title, description) {
    return new Promise( (resolve, reject) => {
        if (!session.conversationData.backlog) {
            reject(new Error('Backlog is not set for this conversation'));
            return;
        }
        var backlog = settings.backlogs[session.conversationData.backlog];
        if (!backlog) {
            reject(new Error('Unknown backlog ' + session.conversationData.backlog));
            return;
        }
        var patch = [ 
            {op: 'add', path: '/fields/System.Title', value: title},
            {op: 'add', path: '/fields/System.Description', value: description || 'Add more details here' },
            {op: 'add', path: '/fields/System.IterationPath', value: backlog.iteration },
            {op: 'add', path: '/fields/System.AreaPath', value: backlog.area },
            //{op: 'add', path: '/fields/System.WorkItemType', value: backlog.item_type},
        ];
        if (bau) {
            patch.push(
                {op: 'add', path: '/fields/System.Tags', value: backlog.bau_tag},
                {
                    op: 'add',
                    path: '/relations/-',
                    value: { url: backlog.bau_epic.url, rel: backlog.epic_relation, attributes: {} }
                }
            );
        }
        console.log(patch);
        witApi.createWorkItem({}, patch, backlog.project, backlog.item_type)
            .then( wit => { 
                session.conversationData.last_wit = wit.id; resolve(wit); 
            })
            .catch( err => { reject(err); });
    });
}

function getTaskId(session, id) {
    if (id === '#last') {
        return parseInt(session.conversationData.last_wit);
    }
    m = id.match(/(?:#|https:\/\/skype.vso.io\/)(\d+)/i);
    if (m) {
        return parseInt(m[1]);
    } else {
        return null;
    }
}
