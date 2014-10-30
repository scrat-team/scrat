var fis = module.exports = require('fis');
fis.require.prefixes = [ 'scrat', 'fis' ];
fis.cli.name = 'scrat';
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.version = require('./version.js');
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];

var defaultConfig = require('./configs/default.js');
fis.config.merge(defaultConfig);

fis.olpm = function(info){
    if(typeof info === 'string') {
        info = {
            code : info,
            pack : arguments[1]
        };
    }
    info.pack = info.pack || fis.olpm.PACK_TYPE_EXTERNAL;
    fis.config.set('olpm', info);
    var domain = 'http://image.uc.cn';
    if(info.hasOwnProperty('domain') && info.domain){
        domain = info.domain.replace(/\/$/, '');
    }
    fis.config.set('roadmap.domain', domain);
    fis.config.set('roadmap.path', require('./configs/olpm.js'));
    fis.config.set('modules.prepackager', require('./plugins/prepackager/olpm-pack.js'));
    fis.config.set('modules.postpackager', require('./plugins/postpackager/olpm-release.js'));
};

fis.olpm.PACK_TYPE_INLINE   = 1;
fis.olpm.PACK_TYPE_EXTERNAL = 2;
//fis.olpm.PACK_TYPE_COMBO    = 3;

fis.lego = function (info) {
    if (typeof info === 'string') info = {code : info};
    fis.config.set('lego', info);
    if (!info.code) {
        fis.log.error('missing project code, use `fis.config.set("lego.code", value);` in fis-conf.js');
        return process.exit(1);
    }
    if (!info.version) info.version = '_';
    var domain = 'http://image.uc.cn';
    if (info.hasOwnProperty('domain') && info.domain) {
        domain = info.domain.replace(/\/$/, '');
    }
    fis.config.set('roadmap.domain', domain);
    fis.config.set('roadmap.path', require('./configs/lego.js'));
    fis.config.set('modules.preprocessor.css', require('./plugins/preprocessor/lego.js').CSS);
    fis.config.set('modules.preprocessor.js', require('./plugins/preprocessor/lego.js').JS);
    fis.config.set('modules.preprocessor.html', require('./plugins/preprocessor/lego.js').HTML);
    fis.config.del('modules.postprocessor');
    fis.config.set('modules.prepackager', require('./plugins/prepackager/lego.js'));
};

//alias
Object.defineProperty(global, 'scrat', {
    enumerable : true,
    writable : false,
    value : fis
});