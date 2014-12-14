'use strict';

fis.lego.wrapped = {};

function resolveModDeps(f) {
    if (!f.isMod) return;

    var rel = fis.file(f.realpathNoExt + {'.css': '.js', '.js': '.css'}[f.rExt]);
    if (!rel.exists() || !rel.isMod) return;

    var id = rel.getId();
    if (f.requires.indexOf(id) === -1) f.requires.push(id);
}

exports.JS = function (content, file) {
    resolveModDeps(file);
    if (!file.isMod || file.isWrapped) return content;

    fis.lego.wrapped[file.getId()] = file;
    file.isWrapped = true;

    var pre = 'lego.define("' + file.getId() + '",function(require,exports,module){';
    var post = file.isUnit ? '},true);' : '});';
    return pre + content + post;
};

exports.CSS = function (content, file) {
    resolveModDeps(file);
    if (file.isMod && !file.isWrapped) {
        var f = fis.file(file.realpath);
        var pre = 'lego.defineCSS("' + file.getId() + '.js",';
        var post = ');';
        f.setContent(pre + JSON.stringify(content) + post);
        f.compiled = true;
        f.isWrapped = true;
        f.useHash = false;
        f.release = file.release + '.js';

        fis.lego.wrapped[file.getId()] = f;
        file.isWrapped = true;
    }
    return content;
};