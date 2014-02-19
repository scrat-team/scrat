var fis = module.exports = require('fis');
fis.require.prefixes = [ 'scrat', 'fis' ];
fis.cli.name = 'scrat';
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');

function createUAEFiles(ret){
    var root = fis.project.getProjectPath();
    //create conf/config.jsion
    var uae_conf = fis.config.get('uae_conf', {});
    fis.util.map(uae_conf, function(name, conf){
        var file = fis.file(root, 'conf', name + '.json');
        file.setContent(JSON.stringify(conf, null, 4));
        ret.pkg[file.subpath] = file;
    });
    //create private/log
    if(!ret.src['/private/log']){
        var file = fis.file(root, 'private', 'log');
        file.setContent('');
        ret.pkg[file.subpath] = file;
    }
}

function readJSON(content, path){
    try {
        return JSON.parse(content);
    } catch (e){
        fis.log.error('invalid json file [' + path + '] : ' + e.message);
    }
}

function createResourceMap(ret, conf, settings, opt){
    var map = {
        version : fis.config.get('version'),
        name : fis.config.get('name'),
        alias : {},
        deps : {}
    };
    var componentFile = ret.src['/component.json'];
    if(componentFile){
        var json = readJSON(componentFile.getContent(), componentFile.subpath);
        fis.util.map(json.dependencies, function(name, version){
            if(/^\d+(\.\d+){2}$/.test(version)){
                var module_name = name.toLowerCase().split('/').join('-');
                var dirname = '/component_modules/' + module_name + '/' + version + '/';
                var file = ret.src[dirname + 'component.json'];
                var alias = name;
                if(file){
                    var json = readJSON(file.getContent(), file.subpath);
                    alias = json.name || alias;
                    if(json.main){
                        if(file = ret.src[dirname + json.main]){
                            map.alias[alias] = file.getId();
                        } else {
                            fis.log.error('missing main file [' + json.main + '] of module [' + name + ']');
                        }
                    } else if(file = ret.src[dirname + 'index.css']){
                        map.alias[alias] = file.getId();
                    } else if(file = ret.src[dirname + 'index.js']){
                        map.alias[alias] = file.getId();
                    } else {
                        fis.log.error('can`t find module [' + name + '@' + version + '] main file');
                    }
                } else if(file = ret.src[dirname + 'index.js']){
                    map.alias[alias] = file.getId();
                } else if(file = ret.src[dirname + module_name + '.js']){
                    map.alias[alias] = file.getId();
                } else if(file = ret.src[dirname + 'index.css']){
                    map.alias[alias] = file.getId();
                } else if(file = ret.src[dirname + module_name + '.css']){
                    map.alias[alias] = file.getId();
                } else {
                    fis.log.error('can`t find module [' + name + '@' + version + '] in [/component.json]');
                }
            } else {
                fis.log.error('invalid version [' + version + '] of component [' + name + ']');
            }
        });
    }
    fis.util.map(fis.config.get('alias', {}), function(name, subpath){
        var file = ret.src['/' + subpath.replace(/^\//, '')];
        if(file){
            map.alias[name] = file.getId();
        } else {
            map.alias[name] = subpath;
        }
    });
    var aliased = {};
    fis.util.map(map.alias, function(alias, id){
        aliased[id] = alias;
    });
    fis.util.map(ret.src, function(subpath, file){
        var id = file.getId();
        if(file.basename.toLowerCase() === 'component.json'){
            file.release = false;
            delete ret.src[subpath];
        } else if(file.isComponent && (file.isJsLike || file.isCssLike)){
            var match = file.subpath.match(/^\/components\/([^\/]+)\/\1\.js$/i);
            if(match && match[1] && !(match[1] in map.alias)){
                map.alias[match[1]] = id;
            }
            if(file.requires.length){
                map.deps[id] = file;
            }
        } else if(id in aliased){
            if(file.requires.length){
                map.deps[id] = file;
            }
        }
    });
    fis.util.map(map.deps, function(id, file){
        var deps = map.deps[id] = [];
        file.requires.forEach(function(depId, index){
            var id = map.alias[depId] || depId;
            if(ret.ids[id]){
                deps.push(depId);
            } else {
                fis.log.warning('undefined module [' + depId + '] require from [' + file.subpath + ']');
            }
        });
    });
    console.log(map);
}

fis.config.set('project.fileType.text', 'handlebars, jade, ejs');
fis.config.set('settings.postprocessor.jswrapper.type', 'amd');
fis.config.set('modules.postpackager', [ createUAEFiles, createResourceMap ]);
fis.config.set('roadmap.path', [
    {
        reg : /\.(ejs|handlebars|md)$/i,
        release : false,
        isHtmlLike : true
    },
    {
        reg : /\.inline\.\w+$/i,
        release : false
    },
    {
        reg : '**.jade'
    },
    {
        reg : /^\/component_modules\/(.*)$/i,
        id : '$1',
        isMod : true,
        useSprite : true,
        release : '/public/c/$1'
    },
    {
        reg : /^\/components\/(.*)$/i,
        id : '${name}/${version}/$1',
        isMod : true,
        useSprite : true,
        isComponent : true,
        release : '/public/c/${name}/${version}/$1'
    },
    {
        reg : /^\/views\/(.*)$/,
        useSprite : true,
        release : '/public/${name}/${version}/$1'
    },
    {
        reg : /^\/public\/(.*)$/,
        useSprite : true,
        release : '/public/${name}/${version}/$1'
    },
    {
        reg : 'map.json',
        release : false
    },
    {
        reg : '**',
        useStandard : false,
        useOptimzer : false
    }
]);

//default uae config
fis.config.set('uae_conf.config', {
    description: 'UAE 会自动修改这个文件中的配置，请勿手工修改',
    memcached : [{
        name : '',
        host : '127.0.0.1',
        port : 11211
    }]
});