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

fis.seo = function(name){
  if(typeof name === 'object'){
    fis.config.merge(name);
  } else {
    fis.config.set('name', name || '');
  }
  fis.config.set('roadmap.path', [
    {
      reg: 'map.json',
      release: 'config/map.json'
    },
    {
      reg: /\/_[^\/]+$/,
      release: false
    },
    {
      reg: /\/readme\.md$/i,
      release: false
    },
    {
      reg: /^\/components\/(.*\.tpl)$/i,
      isHtmlLike: true,
      release: '/views/c/${name}/$1'
    },
    {
      reg: /^\/components\/(.*)$/i,
      isMod: true,
      release: '/public/c/${name}/$1'
    },
    {
      reg: /^\/views\/(.*\.tpl)$/i,
      release: '/views/${name}/$1'
    },
    {
      reg: /^\/views\/(.*)$/i,
      release: '/public/v/${name}/$1'
    },
    {
      reg: '**',
      useCompile: false
    }
  ]);
  fis.config.set('modules', {});
  fis.config.set('modules.packager', 'map');
};

//alias
Object.defineProperty(global, 'scrat', {
    enumerable : true,
    writable : false,
    value : fis
});