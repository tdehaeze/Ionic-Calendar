module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            all: ['src/*.js'],
        },
        concat: {
            dist: {
                src: ['src/calendar_pk.module.js', 'src/*.constant.js', 'src/*.controller.js', 'src/*.directive.js'],
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
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['jshint:all', 'concat:dist', 'uglify:dist', 'sass:dist', 'cssmin:dist']);
};
