module.exports = [
    {
        reg : 'map.json',
        release : false
    },
    {
        //component.json, olpm.json, readme.md, _xxx.oo, xxx.inline.oo
        reg : /\/(component\.json|olpm\.json|readme\.md|_[^\/]+\.\w+|.*\.inline\.\w+|.*\.sh|.*\.bat)$/i,
        release : false
    },
    {
        reg : /^\/views\/(.*\/thumb\.png)$/i,
        release : '/thumb/v/$1'
    },
    {
        reg : /^\/views\/([^\/]+)\/\1\.html$/,
        isLayout : true,
        layoutName : '$1',
        useCache : false,
        release : '/layouts/$1.html'
    },
    {
        reg : /^\/views\/([^\/]+)\.html$/,
        isLayout : true,
        layoutName : '$1',
        useCache : false,
        release : '/layouts/$1.html'
    },
    {
        reg : /^\/views\/(.*)$/i,
        isAssets : true,
        url : '/s/uae/g/06/res/${olpm.code}/v/$1',
        release : '/res/${olpm.code}/v/$1'
    },
    {
        reg : /^\/components\/(.*\/thumb\.png)$/i,
        release : '/thumb/c/$1'
    },
    {
        reg : /^\/components\/([^\/]+\/data\.js)$/i,
        release : '/units/$1',
        isData : true,
        useOptimizer : false,
        useHash : false
    },
    {
        reg : /^\/components\/([^\/]+\/data\.[^\/]+\.js)$/i,
        release : false,
        isData : true,
        useOptimizer : false,
        useHash : false
    },
    {
        reg : /^\/components\/(.*\.(?:js|css|styl))$/i,
        isMod : true,
        url : '/s/uae/g/06/res/${olpm.code}/m/$1',
        release : '/res/${olpm.code}/m/$1'
    },
    {
        reg : /^\/components\/(([^\/]+)\/\2\.ejs)$/i,
        isUnit : true,
        useMap : true,
        isHtmlLike : true,
        release : '/units/$1'
    },
    {
        reg : /^\/components\/.*\.ejs$/i,
        release : false,
        isHtmlLike : true
    },
    {
        reg : /^\/components\/(.*)$/i,
        url : '/s/uae/g/06/res/${olpm.code}/c/$1',
        release : '/res/${olpm.code}/c/$1',
        isAssets : true
    },
    {
        reg : /^\/pkg\/(.*\.(?:js|css|png))$/i,
        isAssets : true,
        url : '/s/uae/g/06/res/${olpm.code}/p/$1',
        release : '/res/${olpm.code}/p/$1'
    },
    {
        reg : '**',
        useHash : false,
        useCompile : false
    }
];