const dashboardFields = [ 
    { name: "title", type: "text", attributes: { required: true }, description: 'The title of the dashboard panel' },
    { name: "description", description: "This will be displayed as narrative on the site", type: "markdown", upload: false },
    { name: "flash", type: "text", description: 'The text displayed in the the ribbon across the top-right of the panel' },
    { name: "upTo", type: "date", description: 'The date shown on the dashboard panel' },
    { name: "notes", description: "Internal notes, not for public display", type: "markdown", upload: false },
    { name: "table_descriptions", description: "The table will contain all events. If you'd like to add a description to an event, you can do so below. The event title must match the name of the event exactly (be wary of trailing spaces, hyphens, capital letters and special characters.", type: "object-list", fields: ["Event title: text", "description: text"]}
    ];

export default dashboardFields;