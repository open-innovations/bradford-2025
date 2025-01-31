// Load PostCSS plugins
import nesting from "npm:postcss-nesting@13.0.1";
import nano from "npm:cssnano@7.0.6";

// Export config
export default {
    plugins: [
        nesting(),
        nano(),
    ]
}