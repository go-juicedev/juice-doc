.. juice documentation master file, created by
   sphinx-quickstart on Sat Nov  5 19:15:50 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Juice 简介
==============================

juice 是一个基于 golang 的 sql mapper 框架，它的目标是提供一个简单易用的 sql mapper 框架，让开发者可以更专注于业务逻辑的开发。

如果你是一个 golang 开发者，或者你正在寻找一个简单易用的 sql mapper 框架，那么 juice 可能是你的不二之选。


项目主页
------------------------------

https://github.com/go-juicedev/juice

**文档链接**

- 简体中文: https://juice-doc.readthedocs.io/en/latest/
- English: https://juice-doc.readthedocs.io/projects/juice-doc-en/en/latest/


特性
------------------------------

- 🚀 轻量级，高性能，无第三方依赖
- 🔧 动态 SQL 支持，灵活构建复杂查询
- 🗄️ 支持多数据源，主从数据库切换
- 🎯 泛型结果集映射，类型安全
- 🔗 中间件机制，可扩展架构
- 📝 自定义表达式和函数
- 🛠️ 代码生成工具
- 🔒 事务管理
- 🔍 SQL 调试和性能监控
- 📊 多种数据库支持 (MySQL, PostgreSQL, SQLite, Oracle)
- 🔧 连接池管理


安装
------------------------------



**版本要求**

- go 1.24+

.. code-block:: bash

   go get -u github.com/go-juicedev/juice

快速开始
------------------------------

1. 编写sql mapper配置文件


.. code-block:: xml

   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <environments default="prod">
           <environment id="prod">
               <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
               <driver>mysql</driver>
           </environment>
       </environments>

       <mappers>
           <mapper namespace="main">
               <select id="HelloWorld">
                   select "hello world" as message
               </select>
           </mapper>
       </mappers>
   </configuration>

..  attention::
   注意：`dataSource` 的格式跟用 `sql.Open()` 函数的格式相同。


2. 编写代码


.. code-block:: go

   package main

   import (
      "context"
      "fmt"
      "github.com/go-juicedev/juice"

      _ "github.com/go-sql-driver/mysql"
   )

   func HelloWorld() {}

   func main() {
      cfg, err := juice.NewXMLConfiguration("config.xml")
      if err != nil {
         fmt.Println(err)
         return
      }

      engine, err := juice.Default(cfg)
      if err != nil {
         fmt.Println(err)
         return
      }
      defer engine.Close()

      message, err := juice.NewGenericManager[string](engine).Object(HelloWorld).QueryContext(context.Background(), nil)
      if err != nil {
         fmt.Println(err)
         return
      }
      fmt.Println(message)
   }




..  attention::

   注意：虽然 `juice` 不依赖第三方库，但是它需要依赖数据库驱动，所以在使用 juice 之前，你需要先安装数据库驱动，比如要使用mysql，
   那么你需要先安装 `github.com/go-sql-driver/mysql`

   如果运行报错，那么可能是因为你的数据库没有启动，或者你的数据库配置有误，检查一下数据库配置是否正确。

3. 运行代码


.. code-block:: bash

   go run main.go

4. 输出结果


.. code-block:: bash

   [juice] 2022/11/05 19:56:49 [main.HelloWorld]  select "hello world" as message  []  5.3138ms
   hello world


如果你看到了上面的输出结果，那么恭喜你，你已经成功运行了 juice。


详细文档
------------------------------

.. toctree::
   :maxdepth: 2
   :caption: 核心功能

   configuration
   mappers
   result_mapping
   tx
   dynamic_sql
   expr
   raw_sql
   middleware

.. toctree::
   :maxdepth: 2
   :caption: 高级功能

   code_generate
   extension
   idea-plugin

.. toctree::
   :maxdepth: 2
   :caption: 其他

   eatmoreapple