使用说明
---------

## 环境搭建

1. 安装开发工具 [scrat](https://github.com/scrat-team/scrat)

    ```shell
    npm install -g scrat
    ```

    > 如果安装中遇到权限问题，可使用 ``sudo`` 安装，或者 ``sudo chown -R $USER /usr/local/lib/node_modules``

1. clone示例项目
    
    ```shell
    git clone https://github.com/scrat-team/project.git
    ```
    
    进入项目目录（后续命令需要在项目目录下执行）
    
    ```shell
    cd project
    ```

1. 使用 [scrat](https://github.com/scrat-team/scrat) 构建你的项目

    ```shell
    scrat release
    ```

1. 启动调试服务器

    ```shell
    scrat server start
    ```

1. 浏览项目效果 http://127.0.0.1:8082/

## 目录结构与规范

```
project (master)
  ┣ component_modules (git@master)
  ┃  ┣ zepto
  ┃  ┃  ┗ 1.0.2
  ┃  ┃     ┣ component.json
  ┃  ┃     ┗ zepto.js
  ┃  ┗ underscore
  ┃     ┗ 1.0.0
  ┃        ┗ underscore.js
  ┣ components
  ┃  ┣ list
  ┃  ┃  ┣ list.js
  ┃  ┃  ┣ list.css
  ┃  ┃  ┗ list.handlebars
  ┃  ┗ nav
  ┃     ┣ img
  ┃     ┃   ┗ icon.png
  ┃     ┣ nav.js
  ┃     ┣ nav.css
  ┃     ┗ nav.handlebars
  ┣ views
  ┃  ┣ mod.js
  ┃  ┣ index.js
  ┃  ┣ index.css
  ┃  ┗ index.html
  ┣ lib
  ┃  ┣ cluster.js
  ┃  ┗ config.js
  ┣ Procfile
  ┣ index.js
  ┣ package.json
  ┣ component.json
  ┗ fis-conf.js
```

目录结构与说明：

* ``component_modules目录``： 存放公共的组件仓库，采用兼容的 [component](https://github.com/component/component) 规范，来自另一个仓库，``非当前项目代码``。
* ``components目录``： 存放当前项目组件，不要求使用component规范，无需 ``component.json`` 描述文件
* ``views目录``：存放页面，以及 ``非模块化`` 的静态资源
* lib目录：非强制规范，建议用作nodejs后端代码的相关文件存放
* ``Procfile文件``：UAE配置文件，其中可指定nodejs运行的入口文件
* index.js：nodejs后端运行的入口文件，由 ``Procfile文件`` 指定，非强制规范
* ``package.json``：nodejs后端所需要的依赖描述文件，即npm的 [package.json](https://www.npmjs.org/doc/files/package.json.html) 文件
* ``component.json``：[component](https://github.com/component/component) 的组件描述文件，这里用来描述当前项目对 ``component_modules目录`` 中模块的依赖。
* ``fis-conf.js``：[scrat](https://github.com/fis/scrat) 工具的配置文件，可指定项目名、项目版本、模块别名等构建信息

## 模块化开发

* 模块目录
    * ``components`` 和 ``component_modules`` 目录下的文件文件均为模块化文件，不要将 ``非模块化`` 资源（主要是js）放到这些目录下
    * ``component_modules`` 目录下的模块可遵从 [component](https://github.com/component/component) 规范，提供 ``component.json`` 描述文件，component.json中的name属性为模块的别名。模块的存放规则为： ``component_modules/{模块名}/{模块版本}/**``
    * ``comopnents`` 目录下的模块为项目模块，无需服从component规范，文件存放规则为： ``component/{模块名}/**``。
* 模块id与别名（alias）
    * 每个js或css文件都有一个 ``完整id``
        * component_modules中文件的完整id形如：``component_modules/zepto/{版本号}/zepto.js``
        * components中文件的完整id形如：``{项目名}/{项目版本}/detail/detail.js``
    * 部分文件有别名
        * component_modules中的模块，如果有 ``component.json`` 描述文件，则component.json中main字段规定的文件，其别名为name字段的值
        * components中，如果文件名和目录同名，则将目录名作为别名记录
* 依赖声明
* js模块化开发
    * 依赖css
    * 使用handlebars
* 工具处理与配置

## 配置文件说明

## 开发工具使用技巧

* 本地开发中使用文件监听、浏览器自动刷新。这个功能实际上是 ``scrat release`` 命令的两个参数，文件监听 ``--watch`` 或 ``-w``， 自动刷新 ``--live`` 或 ``-L``，参数的位置任意，使用缩短参数的时候可以连写，因此以下用法均等价：

    ```shell
    scrat release --live --watch
    scrat release --watch --live
    scrat release -L -w
    scrat release -Lw
    scrat release -wL
    ```
    
    启动文件监听后，不要关闭命令行窗口，编写代码保存即会自动构建、发布、刷新浏览器。如果修改了项目配置文件 ``fis-conf.js`` 需要停止当前监听中的 scrat release 命令，``重新启动``。