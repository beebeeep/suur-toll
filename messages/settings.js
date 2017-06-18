module.exports = {
    backlogs: {
        test: {
            project: 'SCC',
            iteration: 'SCC',
            area: 'SCC',
            bau_tag: 'darkenergy',
            bau_epic: 394567,
            url_shortener: 'http://skype-test2.vso.io',
            additional_fields: [],
            item_type: 'Enabling Specification',
            epic_relation: 'System.LinkTypes.Hierarchy-Reverse',
            item_states: {
                close: 'Closed',
                resolve: 'Resolved',
                progress: 'In Progress',
                open: 'Open',
                block: 'Blocked'
            },
            bau_standard_tags: [
                ['manual\s*(action)?', 'manual action'],
                ['broken\s*(env)?', 'brokenENV']
                ['user\s*(mana|mgmt|mng)', 'user management'],
                ['info(rmation)?\s*(req)?', 'info'],
                ['(minor\s*)?improv', 'improvement']
            ]
        }
    }
};