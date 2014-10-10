module.exports = function(ret, conf, settings, opt){
    var map = ret.olpm;
    var pkg = ret.pkg;
    if(opt.pack && map){
        fis.util.map(pkg, function(subpath, file){
            if(map.files.assetsMap[subpath] !== 1){
                map.files.assets.push({
                    file : opt.md5 ? file.getHashRelease() : file.release,
                    type : file.rExt.replace(/^\./, '')
                });
            }
        });
        delete map.files.assetsMap;
        var file = fis.file(fis.project.getProjectPath('release.json'));
        file.setContent(JSON.stringify(map, null, 4));
        file.compiled = true;
        ret.pkg[file.subpath] = file;
    }
};