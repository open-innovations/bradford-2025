const dashboardFields = [ 
    { name: "title", type: "text", attributes: { required: true }, description: 'The title of the dashboard panel', view: 'admin' },
    { name: "description", description: "This will be displayed as narrative on the site", type: "markdown", upload: false },
    // { name: "upTo", type: "date", description: 'The date shown on the dashboard panel' },
    { name: "notes", description: "Internal notes, not for public display", type: "markdown", upload: false },
    { name: "table_descriptions", description: "Tables in the 'i' popover will show all sources of data that make up the total. If you'd like to add a description to a row of the table, you can do so below. The title must match the name of the row exactly (be wary of trailing spaces, hyphens, capital letters and special characters).", type: "object-list", fields: ["row: text", "description: text"]}
    ];

const sectionNumbers: {[key: string]: string} = {
    'events_total.yml': '1.0',
    'events_in_person.yml': '1.2',
    'events_online.yml': '1.3',
    'events_festivals.yml': '1.4',
    'events_exhibition_days.yml': '1.5',
    'events_community_led.yml': '1.6',
    'events_free_activities.yml': '1.7',
    'events_exhibitions.yml': '1.8',

    'audiences_total.yml': '2.0',
    'audiences_in_person_events.yml': '2.1',
    'audiences_digital.yml': '2.2',
    'audiences_split_bradford.yml': '2.3',
    'audiences_positive_experience.yml': '2.4',

    'participants_total.yml': '3.0',
    'participants_volunteers.yml': '3.1',
    'participants_cultural_learning.yml': '3.2',
    'participants_community.yml': '3.3',
    'participants_training_and_skills.yml': '3.4',
    'participants_creative_health.yml': '3.5',
    'participants_our_patch.yml': '3.6',
    'participants_schools_engaged.yml': '3.7',
} 
function customLabel(name: string) {
        const [section, ...rest] = name.replace(".yml", "").split("_");
        return `${sectionNumbers[name]} &mdash; ${section.toUpperCase()} &mdash; ${rest.join(" ")}`;
    }

const dashboardConfig = {
    fields: dashboardFields,
    documentLabel: customLabel,
    documentName: "{title}.yml",
    // create: false,
    delete: false,
}

export { dashboardConfig };