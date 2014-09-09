'use strict';

function trim(str) {
    return str ? str.replace(/['"\s]/g, '') : str;
}

function resolve(id, ext) {
    // 以 ./ ../ / 开头或包含 :// 不处理
    if (/^(\.|\.\.)?\/|:\/\//.test(id)) return id;

    var orgiId = id;
    var query = id.indexOf('?') !== -1 || '';
    if (query) {
        query = id.slice(query);
        id = id.slice(0, query);
    }
    var files = fis.project.getSource();
    var file;

    // 在工程中找到直接返回
    file = files['/' + id];
    if (file) return file.getId() + query;

    // 可能是别名，查别名表
    var alias = fis.config.get('lego.alias');
    id = alias && alias[id] || id;
    file = files['/' + id];
    if (file) return file.getId() + query;

    // 可能是缩略名，尝试补全
    if (!ext) return orgiId;
    id += '/' + id.split('/').slice(-1)[0] + ext;
    file = files['/' + id];
    if (file) return file.getId() + query;

    // 尝试相似类型后缀名
    var looksLike = {
        '.css': ['.styl']
    };

    if (looksLike.hasOwnProperty(ext)) {
        for (var i = 0, lastExt = ext; i < looksLike[ext].length; i++) {
            id = id.replace(lastExt, looksLike[ext][i]);
            file = files['/' + id];
            if (file) return file.getId() + query;
            lastExt = looksLike[ext][i];
        }
    }

    return orgiId;
}

function extJs(content) {
    return fis.compile.extJs(content, function (m, comment, type, value) {
        if (type && value) {
            m = type + '(' + JSON.stringify(resolve(trim(value), '.js')) + ')';
        } else if (comment) {
            m = fis.compile.analyseComment(comment, function (m, prefix, value) {
                return prefix + JSON.stringify(resolve(trim(value), '.js'));
            });
        }
        return m;
    });
}

function extCss(content) {
    return fis.compile.extCss(content, function (m, comment, url, last, filter) {
        if (url) {
            var type = fis.compile.isInline(fis.util.query(url)) ? 'embed' : 'uri';
            url = JSON.stringify(resolve(trim(url), '.css'));
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
            m = 'src=' + JSON.stringify(resolve(trim(filter), '.css'));
        } else if (comment) {
            m = fis.compile.analyseComment(comment, function (m, prefix, value) {
                return prefix + JSON.stringify(resolve(trim(value), '.css'));
            });
        }
        return m;
    });
}

function extHtml(content) {
    return fis.compile.extHtml(content, function (m, $1, $2, $3, $4, $5, $6, $7, $8) {
        if ($1) { // <script>
            var embed;
            $1 = $1.replace(/(\s(?:data-)?src\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (m, prefix, value) {
                if (fis.compile.isInline(fis.util.query(value))) {
                    embed = JSON.stringify(resolve(trim(value), '.js'));
                    return '';
                } else {
                    return prefix + JSON.stringify(resolve(trim(value), '.js'));
                }
            });
            if (embed) {
                m = $1 + embed;
            } else if (!/\s+type\s*=/i.test($1) || /\s+type\s*=\s*(['"]?)text\/javascript\1/i.test($1)) {
                m = $1 + extJs($2);
            } else {
                m = $1 + extHtml($2);
            }
        } else if ($3) { // <style>
            m = $3 + extCss($4);
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
                            inline += JSON.stringify(resolve(trim(value), '.css'));
                            inline += '</style>';
                        } else {
                            inline = JSON.stringify(resolve(trim(value)));
                        }
                        return '';
                    } else {
                        return prefix + JSON.stringify(resolve(trim(value)));
                    }
                });
                m = inline || m;
            } else if (tag === 'object') {
                m = m.replace(/(\sdata\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (m, prefix, value) {
                    return prefix + JSON.stringify(resolve(trim(value)));
                });
            } else {
                m = m.replace(/(\s(?:data-)?src\s*=\s*)('[^']+'|"[^"]+"|[^\s\/>]+)/ig, function (m, prefix, value) {
                    return prefix + JSON.stringify(resolve(trim(value)));
                });
            }
        } else if ($6) {
            m = JSON.stringify(resolve(trim($6)));
        } else if ($7) {
            m = '<!--' + fis.compile.analyseComment($7, function (m, prefix, value) {
                return prefix + JSON.stringify(resolve(trim(value)));
            }) + $8;
        }
        return m;
    });
}

exports.JS = function (content, file) {
    return file.isMod ? extJs(content) : content;
};

exports.CSS = function (content, file) {
    return file.isMod ? extCss(content) : content;
};

exports.HTML = function (content, file) {
    return file.isMod ? extHtml(content) : content;
};