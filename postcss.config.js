const autoprefixer = require('autoprefixer');

module.exports = {
    plugins: [
        autoprefixer({
            // Note that browsers are configured via .browserslistrc. Other
            // options can go here.
        }),
    ],
};
