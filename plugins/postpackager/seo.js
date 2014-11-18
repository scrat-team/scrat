module.exports = function(ret){
  var framework = fis.config.get('framework');
  framework.res = ret.map.res;
  ret.map = framework;
};