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
                dest: 'src/temp/templates.html.js'
            },
        },
        concat: {
            dist: {
                src: ['src/calendar_pk.module.js', 'src/*.constant.js', 'src/*.directive.js', 'src/*.filter.js', 'src/temp/*.html.js'],
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
                    'dist/css/calendar_pk.css': 'src/scss/calendar_pk.scss'
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
                    'dist/css/calendar_pk.min.css': ['dist/css/calendar_pk.css']
                }
            }
        },
        clean: {
            dist: ['src/temp/*.html.js'],
        },
        watch: {
            js: {
                files: ['src/*.js', 'src/*.html'],
                tasks: ['jshint:all', 'html2js:main', 'concat:dist', 'uglify:dist', 'clean:dist'],
                options: {
                    spawn: false,
                },
            },
            css: {
                files: ['src/scss/*.scss'],
                tasks: ['scsslint:all', 'sass:dist', 'cssmin:dist'],
            }
        },
        scsslint: {
            all: ['src/scss/*.scss'],
            options: {
                colorizeOutput: true,
                config: '.scss-lint.yml',
            },
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('dist', ['jshint:all', 'scsslint:all', 'html2js:main', 'concat:dist', 'uglify:dist', 'sass:dist', 'cssmin:dist', 'clean:dist'])
    grunt.registerTask('default', ['dist', 'watch']);
};
