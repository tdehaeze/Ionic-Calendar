module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            all: ['src/*.js'],
        },
        html2js: {
            options: {
                module: 'templates',
                existingModule: false,
                singleModule: true,
                // base: 'src',
                fileHeaderString: '(function() {\n\'use strict\';\n',
                fileFooterString: '}());',
            },
            main: {
                src: ['src/*.html'],
                dest: 'src/templates.html.js'
            },
        },
        concat: {
            dist: {
                src: ['src/calendar_pk.module.js', 'src/*.constant.js', 'src/*.directive.js', 'src/*.filter.js', 'src/templates.html.js'],
                dest: 'dist/js/calendar_pk.js',
            },
        },
        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    'dist/js/calendar_pk.min.js': ['dist/js/calendar_pk.js']
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'dist/css/calendar.css': 'src/scss/calendar.scss'
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            dist: {
                files: {
                    'dist/css/calendar.min.css': ['dist/css/calendar.css']
                }
            }
        },
        clean: {
            dist: ['src/*.html.js'],
        },
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['jshint:all', 'html2js:main' ,'concat:dist', 'uglify:dist', 'sass:dist', 'cssmin:dist', 'clean:dist']);
};
