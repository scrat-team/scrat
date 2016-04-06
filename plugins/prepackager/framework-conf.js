/**
 * 读取json内容，加一个统一的错误处理
 * @param {String} content
 * @param {String} path
 * @returns {*}
 */
function readJSON(content, path){
    try {
        return JSON.parse(content);
    } catch (e){
        fis.log.error('invalid json file [' + path + '] : ' + e.message);
    }
}

/**
 * 为component_modules目录下的模块建立别名
 * @param {fis.file.File} componentFile 模块的component.json文件对象
 * @param {Object} map 框架配置文件对象
 * @param {Object} ret 系统整理的文件对象
 */
function makeComponentModulesAlias(componentFile, map, ret) {
    //必须存在这个文件
    if(componentFile && componentFile.exists()){
        var json = readJSON(componentFile.getContent(), componentFile.subpath);
        //遍历component.json中的dependencies字段
        fis.util.map(json.dependencies, function(name, version){
            //必须使用明确的版本号
            if(/^\d+\./.test(version)){
                //获取模块名，处理路径分隔符
                var module_name = name.split('/').join('-');
                //根据版本号找到模块目录
                var dirname = '/component_modules/' + module_name + '/' + version + '/';
                //获取模块的component.json文件
                var file = componentFile = ret.src[dirname + 'component.json'];
                //记录alias，默认跟模块名一致
                var alias = name;
                if(file){
                    //读取当前模块的component.json文件，解析内容
                    var json = readJSON(file.getContent(), file.subpath);
                    //如果定义了name字段，就用name字段作为alias
                    alias = json.name || alias;
                    if(json.main){
                        if(file = ret.src[dirname + json.main]){
                            map.alias[alias] = file.getId();
                        } else {
                            fis.log.error('missing main file [' + json.main + '] of module [' + name + ']');
                        }
                    } else if(file = ret.src[dirname + 'index.js']){
                        map.alias[alias] = file.getId();
                    } else if(file = ret.src[dirname + 'index.css']){
                        map.alias[alias] = file.getId();
                    } else {
                        if(json.scripts && json.scripts.length === 1){
                            if(file = ret.src[dirname + json.scripts[0]]){
                                map.alias[alias] = file.getId();
                            }
                        } else if(json.styles && json.styles.length === 1){
                            if(file = ret.src[dirname + json.styles[0]]){
                                map.alias[alias] = file.getId();
                            }
                        } else {
                            fis.log.error('can`t find module [' + name + '@' + version + '] main file');
                        }
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
                makeComponentModulesAlias(componentFile, map, ret);
            } else {
                fis.log.error('invalid version [' + version + '] of component [' + name + ']');
            }
        });
    }
}

module.exports = function (ret, conf, settings, opt){
    var map = fis.config.get('framework', {});
    var aliasConfig = map.alias || {};
    map.version = fis.config.get('version');
    map.name = fis.config.get('name');
    map.combo = !!opt.pack;
    map.urlPattern = map.urlPattern || '/c/%s';
    map.comboPattern = map.comboPattern || '/??%s';
    map.hash = fis.util.md5(Date.now() + '-' + Math.random());
    map.alias = {};
    map.deps = {};
    makeComponentModulesAlias(ret.src['/component.json'], map, ret);
    fis.util.map(aliasConfig, function(name, subpath){
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
    var views = [];
    fis.util.map(ret.src, function(subpath, file){
        var id = file.getId();
        if(file.basename.toLowerCase() === 'component.json'){
            file.release = false;
            delete ret.src[subpath];
        } else if(file.isViews && file.isText()){
            views.push(file);
        } else if(file.isMod && (file.isJsLike || file.isCssLike)){
            if(file.isJsLike){
                var match = file.subpath.match(/^\/(?:app\/components|components)\/(.*?([^\/]+))\/\2\.(js|jsx)$/i);
                if(match && match[1] && !map.alias.hasOwnProperty(match[1])){
                    map.alias[match[1]] = id;
                }
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
    aliased = {};
    fis.util.map(map.alias, function(alias, id){
        aliased[id] = alias;
    });
    fis.util.map(map.deps, function(id, file){
        var deps = [];
        file.requires.forEach(function(depId){
            if(map.alias.hasOwnProperty(depId)){
                deps.push(depId);
            } else if(aliased.hasOwnProperty(depId)){
                deps.push(aliased[depId]);
            } else if(ret.ids.hasOwnProperty(depId)) {
                deps.push(depId);
            } else {
                fis.log.warning('undefined module [' + depId + '] require from [' + file.subpath + ']');
            }
        });
        if(deps.length){
            map.deps[id] = deps;
        } else {
            delete map.deps[id];
        }
    });
    if(map.cache){
        var callback = map.defineCSSCallback || 'require.defineCSS';
        fis.util.map(ret.src, function(subpath, file){
            if(file.isCssLike && file.isMod){
                var content = file.getContent();
                content = callback + "('" + file.getId() + "', " + JSON.stringify(content) + ');';
                var f = fis.file(file.realpath);
                f.setContent(content);
                f.compiled = true;
                f.release = file.release + '.js';
                ret.pkg[subpath + '.js'] = f;
            }
        });
    }
    var stringify = JSON.stringify(map, null, opt.optimize ? null : 4);
    views.forEach(function(file){
        var content = file.getContent();
        var hasChange = false;
        content = content.replace(/\b__FRAMEWORK_CONFIG__\b/g, function(){
            hasChange = true;
            return stringify;
        });
        if(hasChange){
            file.setContent(content);
            opt.beforeCompile(file);
        }
    });
};
