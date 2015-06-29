module.exports = function (ret, conf, settings, opt) {
    var framework = fis.config.get('framework');
    framework.res = ret.map.res;
    framework.combo = !!opt.pack;
    framework.hash = fis.util.md5(JSON.stringify(framework));
    ret.map = framework;
};