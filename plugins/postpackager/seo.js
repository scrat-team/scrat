module.exports = function (ret, conf, settings, opt) {
    var framework = fis.config.get('framework');
    framework.res = ret.map.res;
    framework.hash = fis.util.md5(Date.now() + '-' + Math.random());
    ret.map = framework;
    ret.map.combo = !!opt.pack;
};