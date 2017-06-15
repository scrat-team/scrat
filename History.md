
0.10.0 / 2017-06-15
===================

  * chore: re-publish 0.9.0 to fix `\r` error

0.9.0 / 2017-05-21
==================

  * feat: SEO模式下通过扩展fis.seo()方法实现roadmap.path自定义

0.8.0 / 2016-07-18
==================

  * deps: bump deps version

0.7.0 / 2016-04-29
==================

  * [UPD] 忽略对swig中注释的处理

0.6.0 / 2016-04-16
==================

  * feat: image in components should not in map

0.5.18 / 2016-04-06
===================

  * [plugins/prepackager/framework-conf] 修正版本号不是个位数的组件报 invalid version 错误的问题

0.5.17 / 2016-03-19
===================

  * Release 0.5.17
  * deps: update fis & sass version

0.5.16 / 2016-03-04
===================

  * Release 0.5.16
  * feat: support publish
  * Release 0.5.15
  * add fis-postprocessor-autoprefixer 0.0.5

0.5.14 / 2016-02-17
===================

  * fix: update scrat-command-server 0.0.21

0.5.13 / 2016-02-01
===================

  * Release 0.5.13
  * [UPD]web app模式模块化资源目录的增加 app 路径匹配
  * bump version to 0.5.12
  * deps(fis): 1.9.37 for fis-spriter-csssprites bug
  * update command-server to support tnpm

0.5.10 / 2015-10-30
===================

  * update fis 1.9.36
  * 移除老 Lego 模式代码
  * update deps
  * [UPD] 更新fis-parser-node-sass依赖至v0.1.1
  * Update README.md

0.5.7 / 2015-09-22
==================

  * [UPD] 支持sass/scss
  * [UPD] 支持sass/scss

0.5.6 / 2015-08-20
==================

  * bump version 0.5.6
  * 升级compress版本, 支持上传
  * 引入compress插件

0.5.4-2 / 2015-08-20
====================

  * 修复command-server的node-dev新版本bug问题, 暂时使用旧版本
  * 增加对 scrat-parser-babel 的依赖
  * [UPD] SEO模式支持构建版本校验
  * [UPD] SEO模式支持构建版本校验
  * update command-server, support --debug
  * 升级 fis 到 1.9.28，修正 release 阶段 bug
  * [BUG] 修复markdown语法高亮无法识别问题
  * [UPD] 升级fis内核至v1.9.25
  * [UPD] 升级scrat server至v0.0.17，启动livereload server时需要加--live参数
  * [UPD] 升级scrat-command-server插件至v0.0.16，修复windows下server启动的bug
  * [UPD] 内置handlebars v3.x版本预编译工具
  * [UPD] 基于最新的server，支持自动重启服务
  * 升级command-server, 支持自动重启
  * [BUG] 升级对scrat-command-server的依赖，修复Profile多参数问题
  * [UPD] sass编译不通过，撤销对其的依赖，坑爹
  * 更新版本号
  * LEGO 模式增加 handlebars 规则
  * 升级 scrat-command-server@0.0.13
  * [UPD] 升级scrat init命令至v0.1.3版本，默认清除安装缓存
  * [UPD] 升级scrat init命令至v0.1.3版本，默认清除安装缓存
  * [BUG] 修复对新版本seo模式下require标签的静态分析支持
  * [UPD] 添加对sass/scss的支持
  * [UPD] 添加对sass/scss的支持
  * 增加对less及sass的支持
  * [UPD] server clean命令添加-a, --all 参数，用于server clean的时候清除全部内容，包括node_modules
  * 升级fis内核至v1.9.11
  * 使用 cheerio 代替 xmldom
  * [LEGO]增加jshint配置
  * [LEGO] 调整缓存清除逻辑。
  * [LEGO] 关闭组件化资源
  * [LEGO] 加入夜间模式支持
  * 更新版本号
  * [LEGO] 调整内联模式 mods id 规则
  * seo模式添加csssprite支持
  * [LEGO] prepackager 调整为 postpackager，修正依赖计算逻辑顺序问题
  * 调整 CSS 包装为 JS 逻辑，放到 csssprite 阶段后
  * [LEGO] 开启 csssprite，发布新版
  * 修正内联模式下 view 有变更 CSS 文件不会自动内联的 bug
  * [LEGO] 提供内联模式支持
  * [LEGO] 修正当描述文件不存在 code 字段时的 bug
  * 修正 lego 模式视图及单元元信息覆盖 bug
  * 处理 lego 模式循环依赖问题
  * 修正 lego 模式 data.js 文件不存在时的默认数据
  * hotfix of seo
  * bugfix
  * 更新版本号
  * 增加 lego inline 模式支持
  * ids
  * upate
  * upate
  * combo
  * add seo mode
  * seo mode
  * seo mode
  * [UPD]更正文档链接
  * 调整 lego 模式静态资源发布策略。
  * 移除组建化资源的文件摘要 md5 戳，发布路径中增加以构建为单位的 md5 戳
  * 发布 lego 模式
  * 调整生成带 hash 的模块 id 逻辑
  * 移除 lego 模式 postpackager
  * 模块 id 加入 md5 戳。
  * 调整 lego 模式 preprocessor
  * 移除版本号，组件资源加入 md5 戳
  * update
  * [bugfix] 修复webapp模式下csssprite的问题
  * [Feature] cache不完全依赖optimize参数
  * [Bugfix] 修复olpm下csssprite打包错误的bug
  * 调整单元数据构建逻辑。
  * 对入口 JS 模块包装增加标记，便于前端框架识别
  * 修正包装后的 css 模块 id
  * 更新依赖
  * 更新依赖
  * 增加 livereload 支持
  * [Feature] 添加olpm的csssprite功能
  * 移除单元 name
  * [Bugfix] 修复文件在打包阶段修改内容发布失效的bug
  * 调整单元 data 字段类型，不进行 JSON.stringify
  * 1. 调整 lego 模式发布策略，为内部组件、单元增加版本号； 2. 移除工具对框架配置占位的替换，框架的配置要在离线构建环节才能确定； 3. 增加对 unit.json 和 view.json 的解析。
  * 使用 xmldom 替换 jsdom，解决 windows 下安装复杂问题
  * 调整 JS/CSS 包装代码
  * 向页面配置中输出框架配置
  * 包装模块化 CSS 资源为 JS，便于框架进行缓存。
  * 调整资源 id 生成规则
  * 调整缩略图路径获取逻辑。
  * 增加资源别名支持。
  * 调整文件夹名称
  * 移除 postprocessor，在 prepackager 里面包装 js
  * 修正 postprocessor 配置错误
  * 完成 lego 模式 postpackager 编写
  * 完成单元及页面配置构建部分
  * Update README.md
  * Update README.md
  * 将打包调整为prepackager阶段处理
  * 将打包调整为packager阶段处理
  * 完善README文档
  * 升级fis-parser-marked至v0.0.5
  * 升级scrat install命令，修复小文案
  * 升级scrat install命令，默认--save
  * 支持component的scripts、styles标记
  * 支持component的scripts、styles标记
  * olpm下也会分析页面的模块化引用
  * 修复hash始终唯一的bug
  * 修复hash始终唯一的bug
  * 更新 scrat-command-init
  * 更新对 scrat-command-init 的依赖
  * 内置fis-optimizer-html-minifier插件
  * 升级fis-parser-marked的依赖，修改langPrefix的默认配置，配合highlight.js
  * 更新对 fis-lint-jshint 的依赖
  * v0.2.4
  * 更新依赖
  * 更新依赖
  * 增加 scrat init 命令
  * 更新依赖
  * 增加对 component.json exports 支持
  * 更新 scrat-command-install
  * 使用最新版的install
  * 升级server，支持对package.json的main字段识别
  * olpm项目允许没有name属性
  * 支持jsx
  * 支持jsx
  * css没有建立依赖表的bug
  * css没有建立依赖表的bug
  * hotfix
  * hotfix
  * hotfix
  * 新增对olpm项目的支持 beta2
  * 新增对olpm项目的支持
  * 新增对olpm项目的支持
  * 新增对olpm项目的支持
  * 升级scrat-command-install至v0.0.4，更新GitHub下载地址
  * v0.1.12
  * alpha，支持cache
  * 回滚stylus依赖的升级
  * [feature] 新增功能
  * v0.1.8 添加对styl的支持
  * v0.1.7
  * v0.1.6
  * v0.1.5
  * readme
  * readme
  * Update README.md
  * v0.1.4
  * v0.1.3
  * v0.1.2
  * v0.1.1
  * v0.1.0
  * v0.0.9
  * preferGlobal
  * server bugfix
  * update
  * update
  * v0.0.4
  * v0.0.4
  * v0.0.3
  * v0.0.3
  * 1.0.0
  * 1.0.0
  * update
  * add bin
  * init
