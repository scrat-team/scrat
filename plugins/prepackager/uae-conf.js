module.exports = function(ret){
    var root = fis.project.getProjectPath();
    //create conf/config.json
    var uae_conf = fis.config.get('uae_conf', {});
    fis.util.map(uae_conf, function(name, conf){
        var file = fis.file(root, 'conf', name + '.json');
        file.setContent(JSON.stringify(conf, null, 4));
        ret.pkg[file.subpath] = file;
    });
    //create private/log
    if(!ret.src['/private/log/log']){
        var file = fis.file(root, 'private/log/log');
        file.setContent('');
        ret.pkg[file.subpath] = file;
    }
};