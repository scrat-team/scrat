/**
 * 为所有 HTML/CSS/JS 类型文件提供别名和缩略名能力
 *
 * 别名：
 * fis.lego({
 *   alias: {
 *     hello: 'components/hello'
 *   }
 * });
 *
 * 缩略名：
 * 在 JS 中 components/util -> components/util/util.js
 * 在 CSS 中 components/util -> components/util/util.css 或 components/util/util.styl
 */
'use strict';

function trim(str) {
    return str ? str.replace(/['"\s]/g, '') : str;
}

function resolve(id, ref, ext) {
    // ./ ../ // 开头或包含 :// 的 id 不处理
    if (/^(\.|\.\.|\/\/)?\/|:\/\//.test(id)) return id;

    var orgiId = id;
    id = trim(id);

    var files = fis.project.getSource();
    var file;
    var query = id.indexOf('?') !== -1 || '';
    if (query) {
        query = id.slice(query);
        id = id.slice(0, query);
    }

    // 可能是别名，查别名表
    var alias = fis.config.get('lego.alias') || {};
    id = alias[id] || id;
    file = files['/' + id];
    if (file) return JSON.stringify(file.getId() + query);

    // 可能是缩略名，尝试补全
    if (!ext) return orgiId;
    id += '/' + id.split('/').slice(-1)[0] + ext;
    file = files['/' + id];
    if (file) return JSON.stringify(file.getId() + query);

    // 尝试相似类型后缀名
    var looksLike = {
        '.css': ['.styl']
    };

    if (looksLike.hasOwnProperty(ext)) {
        for (var i = 0, lastExt = ext; i < looksLike[ext].length; i++) {
            id = id.replace(lastExt, looksLike[ext][i]);
            file = files['/' + id];
            if (file) return JSON.stringify(file.getId() + query);
            lastExt = looksLike[ext][i];
        }
    }

    return orgiId;
}

exports.JS = function (content, file) {
    return !file.isMod ? content : fis.compile.extJs(content, function (m, comment, type, value) {
        if (type && value) {
            m = type + '(' + resolve(value, file, '.js') + ')';
        } else if (comment) {
            m = fis.compile.analyseComment(comment, function (m, prefix, value) {
                return prefix + resolve(value, file, '.js');
            });
        }
        return m;
    });
};

exports.CSS = function (content, file) {
    return !file.isMod ? content : fis.compile.extCss(content, function (m, comment, url, last, filter) {
        if (url) {
            var type = fis.compile.isInline(fis.util.query(url)) ? 'embed' : 'uri';
            url = resolve(url, file, '.css');
            if (m.indexOf('@') === 0) {
                if (type === 'embed') {
                    m = url + last.replace(/;$/, '');
                } else {
                    m = '@import url(' + url + ')' + last;
                }
            } else {
                m = 'url(' + url + ')' + last;
            }
        } else if (filter) {
            m = 'src=' + resolve(filter, file, '.css');
        } else if (comment) {
            m = fis.compile.analyseComment(comment, function (m, prefix, value) {
                return prefix + resolve(value, file, '.css');
            });
        }
        return m;
    });
};

exports.HTML = function (content, file) {
    return !file.isMod ? content : fis.compile.extHtml(content, function (m, $1, $2, $3, $4, $5, $6, $7, $8) {
        if ($1) { // <script>
            var embed;
            $1 = $1.replace(/(\s(?:data-)?src\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (m, prefix, value) {
                if (fis.compile.isInline(fis.util.query(value))) {
                    embed = resolve(value, file, '.js');
                    return '';
                } else {
                    return prefix + resolve(value, file, '.js');
                }
            });
            if (embed) {
                m = $1 + embed;
            } else if (!/\s+type\s*=/i.test($1) || /\s+type\s*=\s*(['"]?)text\/javascript\1/i.test($1)) {
                m = $1 + exports.JS($2, file);
            } else {
                m = $1 + exports.HTML($2, file);
            }
        } else if ($3) { // <style>
            m = $3 + exports.CSS($4, file);
        } else if ($5) { // <img|embed|audio|video|link|object|source>
            var tag = $5.toLowerCase();
            if (tag === 'link') {
                var inline, isCssLink = false, isImportLink = false;
                var result = m.match(/\srel\s*=\s*('[^']+'|"[^"]+"|[^\s\/>]+)/i);
                if (result && result[1]) {
                    var rel = result[1].replace(/^['"]|['"]$/g, '').toLowerCase();
                    isCssLink = rel === 'stylesheet';
                    isImportLink = rel === 'import';
                }
                m = m.replace(/(\s(?:data-)?href\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (_, prefix, value) {
                    if ((isCssLink || isImportLink) && fis.compile.isInline(fis.util.query(value))) {
                        if (isCssLink) {
                            inline = '<style' + m.substring(5).replace(/\/(?=>$)/, '').replace(/\s+(?:charset|href|data-href|hreflang|rel|rev|sizes|target)\s*=\s*(?:'[^']+'|"[^"]+"|[^\s\/>]+)/ig, '');
                            inline += resolve(value, file, '.css');
                            inline += '</style>';
                        } else {
                            inline = resolve(value, file);
                        }
                        return '';
                    } else {
                        return prefix + resolve(value, file);
                    }
                });
                m = inline || m;
            } else if (tag === 'object') {
                m = m.replace(/(\sdata\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (m, prefix, value) {
                    return prefix + resolve(value, file);
                });
            } else {
                m = m.replace(/(\s(?:data-)?src\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (m, prefix, value) {
                    return prefix + resolve(value, file);
                });
            }
        } else if ($6) {
            m = resolve($6, file);
        } else if ($7) {
            m = '<!--' + fis.compile.analyseComment($7, function (m, prefix, value) {
                return prefix + resolve(value, file);
            }) + $8;
        }
        return m;
    });
};