exports.JS = function (content, file) {
    if (!file.isMod || file.isWrapped) return content;
    file.isWrapped = true;
    var pre = 'lego.define("' + file.getId() + '",function(require,exports,module){';
    var post = file.isUnit ? '},true);' : '});';
    return pre + content + post;
};

exports.CSS = function (content, file) {
    if (file.isMod && !file.isWrapped) {
        var f = fis.file(file.realpath);
        var pre = 'lego.defineCSS("' + file.getId() + '.js",';
        var post = ');';
        f.setContent(pre + JSON.stringify(content) + post);
        f.compiled = true;
        f.isWrapped = true;
        f.useHash = false;
        f.release = file.release + '.js';
        file.isWrapped = f;
    }
    return content;
};