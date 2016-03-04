module.exports = {
  name: 'publish',
  desc: 'short cmd for release',
  register: function(commander){
    commander
      .option('-d, --dest <names>', 'release output destination', String, 'zip')
      .option('-f, --file <name>', 'release output fileName', String)
      .action(function() {
        var argv = process.argv;
        var options = arguments[arguments.length - 1];
        var newArgv = argv.slice(0, 2).concat(['release', '-opmcuDd', options.dest]);
        if(options.file){
          fis.config.set('settings.deploy.compress.zip.file', options.file);
        }
        fis.log.notice('publish by: `scrat ' + newArgv.slice(2).join(' ') + '`');
        fis.cli.run(newArgv);
      });
  }
};