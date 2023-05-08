配置详情
==============================

``juice`` 默认配置文件为 ``xml`` 格式，我们可以在项目的目录下创建一个 ``xml`` 的文件，然后在其中配置 ``juice`` 的相关信息。

configuring
----------------

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
   <configuration>

   </configuration>

``juice`` 的配置信息都写在 ``configuration`` 标签中，如数据库连接信息， ``sql`` 语句， ``setting`` 等。


environments
----------------

``environments`` 标签用于配置不同的环境，如开发环境，测试环境，生产环境等。

开发者可以根据自己的需要配置不同的环境， ``juice`` 会根据 ``environments`` 的 ``default`` 标签来加载特定的配置信息。

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">

            <environment id="prod">
                <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
                <driver>mysql</driver>
            </environment>

            <environment id="dev">
                <dataSource>./foo.db</dataSource>
                <driver>sqlite3</driver>
            </environment>

        </environments>
    </configuration>

在上面的配置中，我们配置了两个环境，分别是 ``prod`` 和 ``dev``，其中 ``prod`` 是默认的环境， ``juice`` 会根据这个配置来加载数据库连接信息。

.. attention::
    注意：environments 标签中的 default 属性是必须的，如果没有配置这个属性，juice 不知道去加载哪个环境的配置信息。

    每个环境的配置信息都是在 environment 标签中，其中 id 属性是必须且唯一，用于标识不同的环境，dataSource 标签用于配置数据库连接信息，driver 标签用于配置数据库驱动。

配置好环境信息后，我们就可以在代码中使用 ``juice`` 的数据库连接了。


.. code-block:: go

    package main

    import (
        "fmt"
        "github.com/eatmoreapple/juice"
        _ "github.com/go-sql-driver/mysql"
    )

    func main() {
        cfg, err := juice.NewXMLConfiguration("config.xml")
        if err != nil {
            fmt.Println(err)
            return
        }

        engine, err := juice.DefaultEngine(cfg)
        if err != nil {
            fmt.Println(err)
            return
        }

        if err = engine.DB().Ping(); err != nil {
            fmt.Println(err)
            return
        }

        fmt.Println(" connected to database")
    }


provider
----------------

有时候我们不想在配置直接写数据库连接信息，而是想通过代码来配置数据库连接信息，这时候我们就可以使用 ``provider`` 标签来配置数据库连接信息。

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">

            <environment id="prod" provider="env">
                <dataSource>${DATA_SOURCE}</provider>
                <driver>mysql</driver>
            </environment>

        </environments>
    </configuration>

如上所示，我们在 ``prod`` 环境中配置了一个 ``provider`` 标签，它的值为 ``env``。

``env`` 是 ``juice`` 提供的一个默认的 ``provider``，它会从环境变量中获取数据库连接信息。

如果你想自定义 ``provider``，可以参考 ``juice`` 提供的 ``provider`` 的实现，实现自己的 ``provider``。

.. code-block:: go

    // EnvValueProvider defines a environment value provider.
    type EnvValueProvider interface {
        Get(key string) (string, error)
    }


    // RegisterEnvValueProvider registers an environment value provider.
    // The key is a name of the provider.
    // The value is a provider.
    // It allows to override the default provider.
    func RegisterEnvValueProvider(name string, provider EnvValueProvider)


如上所示，只要实现了 ``EnvValueProvider`` 接口，就可以通过 ``juice`` 提供的 ``RegisterEnvValueProvider`` 方法，我们可以注册自己的 ``provider``。




连接池配置
----------------

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">

            <environment id="prod">
                <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
                <driver>mysql</driver>
                <maxIdleConnNum>10</maxIdleConnNum>
                <maxOpenConnNum>10</maxOpenConnNum>
                <maxConnLifetime>3600</maxLifetime>
                <maxIdleConnLifetime>3600</maxIdleConnLifetime>
            </environment>

        </environments>
    </configuration>

**在上面的配置中，我们配置了连接池的相关信息**

- .. class:: maxIdleConnNum 标签用于配置最大空闲连接数。
- .. class:: maxOpenConnNum 标签用于配置最大打开连接数。
- .. class:: maxConnLifetime 标签用于配置连接的最大生命周期, 单位为秒。
- .. class:: maxIdleConnLifetime 标签用于配置空闲连接的最大生命周期, 单位为秒。

开发者可以根据自己的需要配置连接池的相关信息， `juice` 会根据配置信息来初始化连接池。


settings
----------------

`settings` 标签用于往 `juice` 中注入自定义的配置信息。

`settings` 标签是 `settings` 标签的父标签， `settings` 标签中可以有多个 `setting` 标签， `setting` 标签中的 `name` 属性是必须的，用于标识配置信息的名称， `value` 属性是可选的，用于配置配置信息的值。

`settings` 标签是可选的，可以不配置。

具体的用途得看开发者自己的需求了。

如在 `juice` 提供的 `DebugMiddleware` 中间件中，它会根据配置信息来决定是否开启调试模式。默认是开启的，可以在配置文件中关闭。

关闭调试模式的配置如下：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
        <configuration>
            <settings>
                <setting name="debug" value="false"/>
            </settings>
        </configuration>


