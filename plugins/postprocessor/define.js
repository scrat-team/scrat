module.exports = function(content, file){
    if(file.isMod){
        var componentJson = file.dirname + '/component.json';
        var exports = '';
        if(fis.util.isFile(componentJson)){
            var json = require(componentJson);
            if(json.exports){
                var main = fis.util(file.dirname, json.main || 'index.js');
                if(main === file.realpath){
                    exports = ';module.exports = ' + json.exports;
                }
            }
        }
        content = 'define(\'' + file.getId() + '\', function(require, exports, module){' + content + exports + '\n\n});';
    }
    return content;
};