var fis = module.exports = require('fis');
fis.require.prefixes = [ 'scrat', 'fis' ];
fis.cli.name = 'scrat';
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');

function postpackager(ret, conf, settings, opt){
    var root = fis.project.getProjectPath();

    //create conf
    var uae_conf = fis.config.get('uae_conf', {});
    fis.util.map(uae_conf, function(name, conf){
        var file = fis.file(root, 'conf', name + '.json');
        file.setContent(JSON.stringify(conf, null, 4));
        ret.pkg[file.subpath] = file;
    });

    if(!ret.src['/private/log']){
        var file = fis.file(root, 'private', 'log');
        file.setContent('');
        ret.pkg[file.subpath] = file;
    }

    var map = {
        res : {},
        version : fis.config.get('version'),
        alias : {}
    };
    fis.util.map(ret.map.res, function(id, res){
        map.res[id] = {
            url : res.uri,
            type : res.type,
            deps : res.deps
        };
    });
    var views = {};
    fis.util.map(ret.src, function(subpath, file){
        if(file.isComponentModule){
            if(file.basename === 'component.json'){
                try {
                    var json = JSON.parse(file.getContent());
                    var filename = json.main || 'index.js';
                    var main = fis.file(file.dirname, filename);
                    if(main.exists()){
//                        map.alias[json.name] = main.getUrl(opt.hash, opt.domain);
                        map.alias[json.name] = main.getId();
                    } else {
                        fis.log.warning('unable to find main file of [' + file.subpath + ']');
                    }
                } catch (e){
                    fis.log.error(e);
                }
                file.release = false;
                delete ret.src[subpath];
            }
        } else if(file.isHtmlView || file.isJadeView) {
            views[file.subpath] = file;
        }
    });

    var mapContent = JSON.stringify(map, null, opt.optimize ? null : 4);
    fis.util.map(views, function(subpath, file){
        file.setContent(file.getContent().replace(/\b__FIS_FILE_MAP__\b/g, mapContent));
    });

}

fis.config.merge({
    project : {
        fileType : {
            text : 'handlebars, jade, ejs'
        }
    },
    uae_conf : {
        config : {
            description: 'UAE 会自动修改这个文件中的配置，请勿手工修改',
            memcached : [{
                name : '',
                host : '127.0.0.1',
                port : 11211
            }]
        }
    },
    roadmap : {
        path : [
            {
                reg : /^\/component_modules\/(.*\.(?:ejs|handlebars))$/i,
                isHtmlLike : true,
                release : false
            },
            {
                reg : /^\/component_modules\/.*\.json$/i,
                isComponentModule : true,
                useMap : false
            },
            {
                reg : /^\/component_modules\/(.*)$/i,
                isComponentModule : true,
                isMod : true,
                useSprite : true,
                url : '/component_modules/$1',
                release : 'public/component_modules/$1'
            },
            {
                reg : /^\/components\/(.*\.(?:ejs|handlebars))$/i,
                isHtmlLike : true,
                release : false
            },
            {
                reg : /^\/components\/(.*)$/i,
                isMod : true,
                useSprite : true,
                url : '/${name}/${version}/components/$1',
                release : 'public/${name}/${version}/components/$1'
            },
            {
                reg : /^\/views\/(.*\.html?)$/i,
                isHtmlView : true,
                url : '/${name}/${version}/$1',
                release : 'public/${name}/${version}/$1'
            },
            {
                reg : /^\/views\/.*\.jade$/i,
                isJadeView : true
            },
            {
                reg : /^\/views\/(.*)$/i,
                useSprite : true,
                url : '/${name}/${version}/views/$1',
                release : 'public/${name}/${version}/views/$1'
            },
            {
                reg : /(readme\.md)$/i,
                release : false
            },
            {
                reg : 'map.json',
                release : false
            },
            {
                reg : 'component.json',
                release : false
            },
            {
                reg : '**',
                useCompile : false
            }
        ]
    },
    modules : {
        postprocessor: {
            html: 'require-async',
            htm: 'require-async',
            js: 'jswrapper, require-async'
        },
        postpackager : [ postpackager ]
    },
    settings : {
        postprocessor : {
            jswrapper : {
                type : 'amd'
            }
        }
    }
});