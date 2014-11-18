module.exports = function(ret, conf, settings, opt){
  var framework = fis.config.get('framework');
  framework.res = ret.map.res;
  ret.map = framework;
  ret.map.combo = !!opt.pack;
};