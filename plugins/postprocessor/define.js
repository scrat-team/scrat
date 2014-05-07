module.exports = function(content, file){
    if(file.isMod){
        content = 'define(\'' + file.getId() + '\', function(require, exports, module){' + content + '\n\n});';
    }
    return content;
};