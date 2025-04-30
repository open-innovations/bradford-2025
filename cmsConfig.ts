const dashboardFields = [ 
    { name: "title", type: "text", attributes: { required: true }, description: 'The title of the dashboard panel' },
    { name: "description", description: "This will be displayed as narrative on the site", type: "markdown", upload: false },
    { name: "flash", type: "text", description: 'The text displayed in the the ribbon across the top-right of the panel' },
    { name: "upTo", type: "date", description: 'The date shown on the dashboard panel' },
    { name: "notes", description: "Internal notes, not for public display", type: "markdown", upload: false },
    { name: "table_descriptions", description: "Tables in the 'i' popover will show all sources of data that make up the total. If you'd like to add a description to a row of the table, you can do so below. The title must match the name of the row exactly (be wary of trailing spaces, hyphens, capital letters and special characters).", type: "object-list", fields: ["row: text", "description: text"]}
    ];
function customLabel(name) {
        let [section,...rest] = name.replace(".yml", "").split("_");
        section = section.toUpperCase();
        rest = rest.join(" ");
        return `${section}: ${rest}`;
    }
export { dashboardFields, customLabel };