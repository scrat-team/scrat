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

fis.seo = function(name, roadmapPath){
  if(arguments[0] && !!arguments[0].push) {
    roadmapPath = name
    name = ''
  }

  var builtinRules = [
    {
      reg: 'map.json',
      release: 'config/map.json'
    },
    {
      reg: /\/(components|views)(?=\/).*\/_[^\/]+\.tpl$/,
      isHtmlLike: true,
      isJsLike: false,
      isSwig: true,
      release: false
    },
    {
      reg: /\/(components|views)(?=\/).*\/_[^\/]+$/,
      release: false
    },
    {
      reg: /\/readme\.md$/i,
      release: false
    },
    {
      reg: /^\/components\/(.*\.tpl)$/i,
      isHtmlLike: true,
      isJsLike: false,
      isSwig: true,
      useMap: true,
      useDomain: false,
      url: 'views/c/$1',
      release: '/views/c/$1'
    },
    {
      reg: /^\/components\/(.*\.(js|css))$/i,
      isMod: true,
      useSprite: true,
      release: '/public/c/$1'
    },
    {
      reg: /^\/components\/(.*)$/i,
      useSprite: true,
      release: '/public/c/$1'
    },
    {
      reg: /^\/views\/(.*\.tpl)$/i,
      isHtmlLike: true,
      useMap: true,
      isSwig: true,
      useDomain: false,
      url: 'views/$1',
      release: '/views/$1'
    },
    {
      reg: /^\/views\/(.*)$/i,
      useSprite: true,
      release: '/public/v/$1'
    },
    {
      reg: '**',
      useMap: false,
      useHash: false,
      useCompile: false
    }
  ];
  var userRule = roadmapPath && roadmapPath.push && roadmapPath.length

  if(typeof name === 'object') {
    fis.config.merge(name);
  } else {
    fis.config.set('name', name || '');
  }

  fis.config.set('roadmap.path', userRule ? roadmapPath : builtinRules);

  fis.config.set('modules.packager', 'map');
  fis.config.set('modules.preprocessor.tpl', require('./plugins/preprocessor/swig.js'));
  fis.config.set('modules.postpackager', require('./plugins/postpackager/seo.js'));
};

//register command plugins
['publish'].forEach(function(name){
  fis.require._cache['command-' + name] = require('./plugins/command/' + name);
});

//alias
Object.defineProperty(global, 'scrat', {
    enumerable : true,
    writable : false,
    value : fis
});
