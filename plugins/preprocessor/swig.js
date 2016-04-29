module.exports = function(content, file){
  if(file.isSwig){
    var map = fis.compile.lang;
    var reg = /\{#[\s\S]*?#\}|(\{%\s*)(?:(require\s+(?:\$id\s*=\s*)?)('[^']+'|"[^"]+")([\s\S]*?%\})|(script\s*%\})([\s\S]+?)(\{%\s*endscript\s*%}))/g;
             //    注释      |(  1   )(?:(            2             )(        3      )(     4     )|(     5      )(    6   )(          7         ))/
    content = content.replace(reg, function(m, $1, $2, $3, $4, $5, $6, $7){
      if($2){
        m = $1 + $2 + map.require.ld + $3 + map.require.rd + $4;
      } else if($5){
        m = $1 + $5 + fis.compile.extJs($6) + $7;
      }
      return m;
    });
  }
  return content;
};
