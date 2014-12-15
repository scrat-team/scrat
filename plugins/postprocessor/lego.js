'use strict';

exports.JS = function (content, file) {
    if (file.isMod) {
        var pre = 'lego.define("' + file.getId() + '",function(require,exports,module){';
        var post = file.isUnit ? '},true);' : '});';
        content = pre + content + post;
    }
    return content;
};