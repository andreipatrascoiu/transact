module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean:
    {
        all: ['build/', 'server/resources/doc', '/source']
    },
    copy:
    {
        all:
        {
            files: [
                {
                    expand: true,
                    cwd: './',
                    src: [ 'main.js'],
                    dest: 'source'
                },
                {src: ['curier/curier.js'], dest: 'source/curier.js'},
                {src: ['db/db.js'], dest: 'source/db.js'},
                {src: ['easypay/easypay.js'], dest: 'source/easypay.js'},
                {src: ['google/google.js'], dest: 'source/google.js'},
                {src: ['server/server.js'], dest: 'source/server.js'}
            ]
        }
    },
    uglify:
    {
        all:
        {
            files: [{
                    expand: true,
                    cwd: 'source/',
                    src: ['*.js'],
                    dest: 'build',
                    rename  : function (dest, src) {
                      var folder    = src.substring(0, src.lastIndexOf('/'));
                      var filename  = src.substring(src.lastIndexOf('/'), src.length);
                
                      filename  = filename.substring(0, filename.lastIndexOf('.'));
                
                      return dest + folder + '/' + filename + '.min.js';
                    }
                }]
        }
    },
    jsdoc : {
        dist : {
            src: ['source/*.js'],
            options: {
                destination: 'server/resources/doc'
            }
        }
    }
    
  });

  // Load the plugins that provide the tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'copy', 'uglify', 'jsdoc']);

};