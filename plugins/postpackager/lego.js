'use strict';

var cheerio = require('cheerio');
var forEach = Array.prototype.forEach;
var liveHost, livePort;
var defaultLiveHost = (function () {
    var net = require('os').networkInterfaces();
    for (var key in net) {
        if (net.hasOwnProperty(key)) {
            var details = net[key];
            if (details && details.length) {
                for (var i = 0, len = details.length; i < len; i++) {
                    var ip = String(details[i].address).trim();
                    if (ip && /^\d+(?:\.\d+){3}$/.test(ip) && ip !== '127.0.0.1') {
                        return ip;
                    }
                }
            }
        }
    }
    return '127.0.0.1';
})();

function getDeps(file, files, appendSelf, deps) {
    appendSelf = appendSelf !== false;
    deps = deps || {css: [], js: [], status: {}};
    // status: 1-计算中, 2-已添加

    var id = file.getId();
    deps.status[id] = 1;

    file.requires.forEach(function (id) {
        var f = files.ids[id];
        if (!f) fis.log.warning('module [' + id + '] not found');
        else if (!deps.status[id]) getDeps(f, files, true, deps);
    });

    var type = file.rExt.slice(1);
    if (appendSelf && deps[type] && deps.status[id] !== 2) {
        deps[type].push(id.replace(file.rExt, ''));
        deps.status[id] = 2;
    }

    return {css: deps.css.slice(), js: deps.js.slice()};
}

module.exports = function (ret, conf, settings, opt) {
    var lego = fis.config.get('lego');
    var map = ret.lego = {
        code: lego.code,
        views: [],
        units: []
    };
    var units = {};

    var needInline = false;
    var inlineMods = {};
    fis.util.map(ret.src, function (subpath, file) {
        if (!file.isMod || file.isHtmlLike) return;

        var id = file.getId();
        var content = file.getContent();
        if (file.isCssLike) {
            // 发布包装后的 CSS 文件
            id += '.js';
            content = 'lego.defineCSS(' + JSON.stringify(id) + ',' + JSON.stringify(content) + ');';
            var f = fis.file(file.realpath);
            f.setContent(content);
            f.compiled = true;
            f.useHash = false;
            f.release = file.release + '.js';
            ret.pkg[subpath + '.js'] = f;
        }
        inlineMods[id] = content;
    });

    fis.util.map(ret.src, function (subpath, file) {
        var obj, meta;
        if (file.isView) {
            var $ = cheerio.load(file.getContent());

            obj = {
                code: lego.code + '_container_' + file.filename,
                name: file.filename,
                description: '',
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
            };

            // 解析 view.json，提取 name、description 等信息
            if (fis.util.exists(file.dirname + '/view.json')) {
                meta = fis.file(file.dirname + '/view.json');
                meta = JSON.parse(meta.getContent() || '{}');
                if (meta.code) meta.code = lego.code + '_container_' + meta.code;
                if (meta.mode === 'inline') needInline = true;
                fis.util.merge(obj, meta);
                meta = null;
            }

            // 解析 head，提取 META、TITLE 及非组件化资源
            $('head').children().each(function (i, el) {
                if (el.type !== 'tag' && el.type !== 'script' && el.type !== 'style') return;
                var $el = $(el);
                switch (el.name.toUpperCase()) {
                case 'META':
                    if ($el.attr('name')) {
                        obj.head.metas.push({
                            name: $el.attr('name'),
                            content: $el.attr('content')
                        });
                    }
                    break;
                case 'TITLE':
                    if ($el.text()) obj.head.title = $el.text();
                    break;
                case 'LINK':
                    if ($el.attr('rel').toLowerCase() === 'stylesheet') {
                        obj.head.styles.push({
                            url: $el.attr('href')
                        });
                    }
                    break;
                case 'STYLE':
                    if ($el.text()) {
                        obj.head.styles.push({
                            content: $el.text()
                        });
                    }
                    break;
                case 'SCRIPT':
                    if ($el.attr('src')) {
                        obj.head.scripts.push({
                            url: $el.attr('src')
                        });
                    } else if ($el.text()) {
                        obj.head.scripts.push({
                            content: $el.text()
                        });
                    }
                    break;
                }
            });

            $('body').children().each(function (i, el) {
                if (el.type !== 'tag' && el.type !== 'script' && el.type !== 'style') return;
                var $el = $(el);
                switch (el.name.toUpperCase()) {
                case 'LINK':
                    switch ($el.attr('rel').toLowerCase()) {
                    case 'unit':
                        var attr = fis.util.clone($el.attr());
                        if (attr.name) {
                            attr.code = lego.code + '_unit_' + attr.name;
                            delete attr.name;
                            delete attr.rel;
                            obj.body.units.push(attr);
                        }
                        break;
                    case 'stylesheet':
                        obj.body.styles.push({
                            url: $el.attr('href')
                        });
                        break;
                    }
                    break;
                case 'STYLE':
                    if ($el.text()) {
                        obj.body.styles.push({
                            content: $el.text()
                        });
                    }
                    break;
                case 'SCRIPT':
                    if ($el.attr('src')) {
                        obj.body.scripts.push({
                            url: $el.attr('src')
                        });
                    } else if ($el.text()) {
                        obj.body.scripts.push({
                            content: $el.text()
                        });
                    }
                    break;
                }
            });

            // 增加 livereload 支持
            if (opt.live) {
                liveHost = liveHost || fis.config.get('livereload.hostname', defaultLiveHost);
                livePort = livePort || fis.config.get('livereload.port', 8132);
                obj.body.scripts.push({
                    url: 'http://' + liveHost + ':' + livePort + '/livereload.js'
                });
            }

            map.views.push(obj);
            delete ret.src[file.subpath];
            file.release = false;
        } else if (file.isUnit) {
            // 与目录同名的 ejs、js、css 文件都可以成为单元
            obj = units[file.filename];
            if (!obj) {
                obj = units[file.filename] = {
                    code: lego.code + '_unit_' + file.filename,
                    name: file.filename,
                    description: ''
                };
                map.units.push(obj);

                // 解析 unit.json，提取 name、description 等信息
                if (fis.util.exists(file.dirname + '/unit.json')) {
                    meta = fis.file(file.dirname + '/unit.json');
                    meta = JSON.parse(meta.getContent() || '{}');
                    if (meta.code) meta.code = lego.code + '_unit_' + meta.code;
                    fis.util.merge(obj, meta);
                    meta = null;
                }
            }

            if (file.isHtmlLike) {
                obj.source = file.getContent();
                var data = ret.src[file.subdirname + '/data.js'];
                if (data) {
                    obj.data = data.getContent();
                    delete ret.src[data.subpath];
                    data.release = false;
                } else {
                    obj.data = 'module.exports = {};';
                }
                // 以 HTML 为单元入口计算依赖
                delete obj.css;
                delete obj.js;
                obj = fis.util.merge(obj, getDeps(file, ret));
                obj.type = 'html';
                delete ret.src[file.subpath];
                file.release = false;
            } else if (file.isCssLike && !obj.type) {
                // 单元无 HTML 入口和 JS 入口，以 CSS 为入口计算依赖
                obj = fis.util.merge(obj, getDeps(file, ret));
                obj.type = 'css';
            } else if (file.isJsLike && obj.type !== 'html') {
                // 单元无 HTML 入口，以 JS 为入口计算依赖
                delete obj.css;
                obj = fis.util.merge(obj, getDeps(file, ret));
                obj.type = 'js';
            }

            var thumb = ret.src[file.subdirname + '/thumb.png'];
            if (thumb) obj.thumb = thumb.getUrl(opt.md5, opt.domain);
        } else if (file.isOther && opt.dest !== 'preview') {
            delete ret.src[file.subpath];
            file.release = false;
        }
    });

    if (needInline) map.mods = inlineMods;

    var file = fis.file(fis.project.getProjectPath('release.json'));
    file.setContent(JSON.stringify(map, null, 2));
    file.compiled = true;
    ret.pkg[file.subpath] = file;
};