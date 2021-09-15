# /scss

Jellyfish SCSS is imported into each directory from node_modules and compiled on build.

`compile.scss` is compiled by Grunt into `/dist/css/style.css`, with Jellyfish SCSS being compiled ahead of the project SCSS. This allows for cascading within the outputted css.

You can override the default Jellyfish variables with the settings file `_settings.scss`
