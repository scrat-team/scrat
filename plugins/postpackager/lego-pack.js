'use strict';

var vm = require('vm');
var jsdom = require('jsdom').jsdom;
var LINK_PROPS_RE = /\s([a-z-]+)\s*=\s*"([^"]+)"/g;

function renderError(err) {
    var html = '<div style="color:red">';
    html += '<h2>' + (err.message || err) + '</h2>';
    if (err.stack) {
        html += '<pre>' + err.stack + '</pre>';
    }
    html += '</div>';
    return html;
}

// 通过指定 id 获取文件对象
function getFile(id, ext, files) {
    // 不是别名直接返回
    var f = files.ids[id];
    if (f) return f;

    // 使用给定后缀解析别名
    id += '/' + id.split('/').slice(-1)[0] + ext;
    f = files.ids[id];
    if (f) return f;

    // 使用相似类型后缀试解析别名
    var lookslike = {
        '.css': '.styl',
        '.styl': '.css'
    };

    if (lookslike.hasOwnProperty(ext)) {
        id = id.replace(ext, lookslike[ext]);
        f = files.ids[id];
        if (f) return f;
    }
}

function getDeps(file, ret, appendSelf, deps) {
    appendSelf = appendSelf !== false;
    deps = deps || [];

    file.requires.forEach(function (id) {
        var f = ret.ids[id];
        if (!f) {
            var alias = id;
            f = getFile(id, file.ext, ret);
            if (!f) fis.log.warning('module [' + alias + '] not found');
        }

        if (f && f.isJsLike === file.isJsLike &&
            f.isCssLike === file.isCssLike) {
            getDeps(f, ret, true, deps);
        }
    });

    if (appendSelf) deps.push(file.release);
    return deps;
}

module.exports = function (ret, conf, settings, opt) {
    var lego = fis.config.get('lego');
    if (!lego.code) {
        fis.log.error('missing project code, use `fis.config.set("lego.code", value);` in fis-conf.js');
    }

    var map = {
        code: lego.code,
        views: [],
        units: []
    };
    var units = {};

    fis.util.map(ret.src, function (subpath, file) {
        if (file.isView) {
            var doc = jsdom(file.getContent());
            var obj = {
                head: {
                    metas: [],
                    styles: [],
                    scripts: []
                },
                body: {
                    units: [],
                    styles: [],
                    scripts: []
                }
            }

            // 解析 head，提取 META、TITLE 及非组件化资源
            fis.util.map(doc.head.children, function (_, el) {
                switch (el.tagName) {
                case 'META':
                    if (el.name) {
                        obj.head.metas.push({
                            name: el.name,
                            content: el.content
                        });
                    }
                    break;
                case 'TITLE':
                    obj.head.title = el.innerHTML;
                    break;
                case 'LINK':
                    if (el.rel === 'stylesheet') {
                        obj.head.styles.push({
                            url: el.href
                        });
                    }
                    break;
                case 'STYLE':
                    obj.head.styles.push({
                        content: el.innerHTML
                    });
                    break;
                case 'SCRIPT':
                    if (el.src) {
                        obj.head.scripts.push({
                            url: el.src
                        });
                    } else {
                        obj.head.scripts.push({
                            content: el.innerHTML
                        });
                    }
                    break;
                }
            });

            // 解析 body，提取布局、单元及非组件化资源
            fis.util.map(doc.body.children, function (_, el) {
                switch (el.tagName) {
                case 'LINK':
                    switch (el.rel) {
                    case 'layout':
                        // TODO 此处只是提取布局配置，暂不实现布局支持
                        var html = el.outerHTML;
                        el = {};
                        while (LINK_PROPS_RE.exec(html)) {
                            el[RegExp.$1] = RegExp.$2;
                        }
                        if (el.name) {
                            delete el.rel;
                            el.code = lego.code + '_layout_' + el.name;
                            obj.body.layouts.push(el);
                        }
                        break;
                    case 'unit':
                        var html = el.outerHTML;
                        el = {};
                        while (LINK_PROPS_RE.exec(html)) {
                            el[RegExp.$1] = RegExp.$2;
                        }
                        if (el.name) {
                            delete el.rel;
                            el.code = lego.code + '_unit_' + el.name;
                            obj.body.units.push(el);
                        }
                        break;
                    case 'stylesheet':
                        obj.body.styles.push({
                            url: el.href
                        });
                        break;
                    }
                    break;
                case 'STYLE':
                    obj.body.styles.push({
                        content: el.innerHTML
                    });
                    break;
                case 'SCRIPT':
                    if (el.src) {
                        obj.body.scripts.push({
                            url: el.src
                        });
                    } else {
                        obj.body.scripts.push({
                            content: el.innerHTML
                        });
                    }
                    break;
                }
            });

            map.views.push(obj);
            delete ret.src[file.subpath];
            file.release = false;
        } else if (file.isUnit) {
            // 与目录同名的 ejs、js、css 文件都可以成为单元
            var obj = units[file.filename];
            if (!obj) {
                obj = units[file.filename] = {};
                map.units.push(obj);
            }
            obj.name = file.filename;
            obj.code = lego.code + '_unit_' + obj.name;

            if (file.isHtmlLike) {
                obj.source = file.getContent();
                var data = ret.src[file.subdirname + '/data.js'];
                if (data) {
                    var sandbox = {module: {}};
                    var code = 'var exports=module.exports={};' + data.getContent();
                    try {
                        vm.runInNewContext(code, sandbox);
                        obj.data = JSON.stringify(sandbox.module.exports);
                    } catch (e) {
                        fis.log.error('[' + data.getId() + '] is illegal: ' + e.message);
                        obj.data = {};
                    }
                    sandbox = null;
                } else {
                    obj.data = {};
                }
                delete ret.src[file.subpath];
                file.release = false;
            } else if (file.isCssLike) {
                obj.css = getDeps(file, ret);
            } else if (file.isJsLike) {
                obj.js = getDeps(file, ret);
            }

            var thumb = ret.src[file.subdirname + '/thumb.png'];
            if (thumb) obj.thumb = thumb.release;
        } else if (file.isOther && opt.dest !== 'preview') {
            delete ret.src[file.subpath];
            file.release = false;
        }
    });

    var file = fis.file(fis.project.getProjectPath('release.json'));
    file.setContent(JSON.stringify(map, null, 2));
    file.compiled = true;
    ret.pkg[file.subpath] = file;
};