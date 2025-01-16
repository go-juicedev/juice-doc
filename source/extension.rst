扩展
========

配置文件打包到可执行文件
----------------------

.. code-block:: go

    cfg, err := juice.NewXMLConfiguration("config.xml")

这是我们最开始用来加载配置文件的方式。

这种方式有一个问题，当我们的go程序编制之后，需要依赖这个配置文件来运行，它们不是一个整体。

在go1.16标准库新增了embed这个库，它允许开发者将静态文件打包到go的可执行文件里面去。

juice也提供了这样的支持。

.. code-block:: go

    package main

    import (
        "embed"
        "fmt"
        "github.com/go-juicedev/juice"
    )

    //go:embed config.xml
    var fs embed.FS

    func main() {
        cfg, err := juice.NewXMLConfigurationWithFS(fs, "config.xml")
        if err != nil {
            panic(err)
        }
        fmt.Println(cfg)
    }

注意：当你的mappers里面引用了别的mapper文件的时候，你的所有的被引用的mapper文件也需要被打包进来。

如：

.. code-block:: xml

    <mappers>
        <mapper resource="mappers.xml"/>
    </mappers>

这时候我们最好的做法是将这些配置文件放在一个文件夹下面。

.. code-block:: shell

    ├── config
      ├── config.xml
      └── mappers.xml

如上所示，我们的文件布局是这样的。

这时候我们只需要把代码改一下


.. code-block:: go

    package main

    import (
        "embed"
        "fmt"
        "github.com/go-juicedev/juice"
    )

    //go:embed config
    var fs embed.FS

    func main() {
        cfg, err := juice.NewXMLConfigurationWithFS(fs, "config/config.xml")
        if err != nil {
            panic(err)
        }
        fmt.Println(cfg)
    }

这样就解决上面的问题了。


读写分离
--------

Juice 提供了一个强大的读写分离实现，用于优化数据库性能和可扩展性。

配置多数据源
~~~~~~~~~~

首先，在配置文件中配置多个数据源：

.. code-block:: xml

    <environments default="master">
        <environment id="master">
            <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
            <driver>mysql</driver>
        </environment>

        <environment id="slave1">
            <dataSource>root:qwe123@tcp(localhost:3307)/database</dataSource>
            <driver>mysql</driver>
        </environment>

        <environment id="slave2">
            <dataSource>root:qwe123@tcp(localhost:3308)/database</dataSource>
            <driver>mysql</driver>
        </environment>
    </environments>

默认情况下，Juice 只会连接 ``environments`` 中 ``default`` 属性指定的数据源。
建议将 ``master`` 设置为默认数据源以处理写操作。

启用读写分离
~~~~~~~~~~

要启用读写分离功能，需要使用 ``TxSensitiveDataSourceSwitchMiddleware`` 中间件：

.. code-block:: go

    var engine *juice.Engine
    ... // 初始化
    engine.Use(&juice.TxSensitiveDataSourceSwitchMiddleware{})

路由策略
~~~~~~~

Juice 支持多种读操作路由策略，可以在语句级别或全局级别配置：

全局配置
^^^^^^^

在项目的 ``settings`` 中配置默认的路由策略：

.. code-block:: xml

    <settings>
        <setting name="selectDataSource" value="?"/>
    </settings>

语句级别配置
^^^^^^^^^^

1. **指定数据源**

   明确指定从库进行读取：

   .. code-block:: xml

        <select id="GetUserByID" dataSource="slave1">
            select * from user where id = #{id}
        </select>

2. **随机路由**

   使用 ``?`` 从所有可用数据源中随机选择（包括主库）：

   .. code-block:: xml

        <select id="GetUserByID" dataSource="?">
            select * from user where id = #{id}
        </select>

3. **仅从库随机路由**

   使用 ``?!`` 从从库中随机选择（排除主库）：

   .. code-block:: xml

        <select id="GetUserByID" dataSource="?!">
            select * from user where id = #{id}
        </select>

注意：语句级别的配置优先级高于全局配置。如果语句没有配置 ``dataSource`` 属性，则使用全局配置中的 ``selectDataSource`` 值。


事务安全
~~~~~~~

中间件具有事务感知能力，当检测到当前操作在事务中时，将不会进行数据源切换，直接使用当前事务的数据源，以保证事务的完整性和数据一致性。

最佳实践
~~~~~~~

1. 所有写操作使用主库
2. 读密集型操作使用 ``?!`` 在从库间分散负载
3. 当需要特定从库特性时，使用显式路由（如 ``slave1``、 ``slave2`` ）
4. 当读一致性要求不高时，可以使用 ``?`` 让主库也参与负载均衡

使用场景
~~~~~~~

读写分离特别适用于：

- 读操作密集的场景
- 需要扩展读取能力
- 需要减轻主库负载
- 提升整体应用性能


链路追踪
--------

跟上面读写分离一个道理，想要对实现代码的无侵入式的增加新功能，我们可以利用中间件来链路追踪。

下面是一个伪代码

.. code-block:: go

    type TraceMiddleware struct{}

    func (r TraceMiddleware) QueryContext(_ *juice.Statement, next juice.QueryHandler) juice.QueryHandler {
        return func(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
            trace.Log(ctx, "query", query) // your own trace
            return next(ctx, query, args...)
        }
    }

    func (r TraceMiddleware) ExecContext(stmt *juice.Statement, next juice.ExecHandler) juice.ExecHandler {
        return func(ctx context.Context, query string, args ...any) (sql.Result, error) {
            trace.Log(ctx, "exec", query) // your own trace
            return next(ctx, query, args...)
        }
    }


XML文档约束
-----------

XML 文档约束（XML Document Type Definition，DTD）是一种用于定义 XML 文档结构和规则的文档类型定义语言。通过使用 DTD，我们可以约束一个 XML 文档只能包括哪些元素、元素的属性、元素之间的关系和顺序等信息。

在实际应用中，通常需要将 DTD 文件与 XML 文档关联起来，以便在解析 XML 文档时自动进行验证。在 XML 文档中，可以通过 <!DOCTYPE> 元素来指定 DTD 文件及其位置。

举例来说，在 juice 的配置文件 config.xml 或者 mapper.xml 中，我们可以通过指定 <!DOCTYPE> 元素中的 PUBLIC 属性和 URI 来关联 DTD 文件。这样，当我们在编辑器或者其他工具中打开 XML 文件时，就可以根据 DTD 定义的规则检查 XML 文档是否符合规范，并且发现潜在的错误和问题。

config xml

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE configuration PUBLIC "-//juice.org//DTD Config 1.0//EN"
            "https://raw.githubusercontent.com/eatmoreapple/juice/main/config.dtd">

mapper xml

.. code-block:: xml

    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//juice.org//DTD Config 1.0//EN"
            "https://raw.githubusercontent.com/eatmoreapple/juice/main/mapper.dtd">
