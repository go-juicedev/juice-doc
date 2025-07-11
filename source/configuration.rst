配置详情
==============================

配置文件格式
----------------

Juice 使用 ``XML`` 作为默认配置格式，提供了清晰和结构化的配置方式。

基础结构
----------------

所有的 Juice 配置都需要包含在根元素 ``configuration`` 中：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <!-- 在这里添加 Juice 的配置信息 -->
    </configuration>

.. note::
    XML 配置提供了良好的可读性和维护性，使配置结构清晰可见。建议使用规范的 XML 格式化工具来保持配置文件的整洁。


environments
----------------

环境配置
~~~~~~~~~~~~~~

``environments`` 标签是 Juice 的核心配置元素，用于管理不同运行环境（如开发、测试、生产等）的数据库连接配置。通过这个机制，开发者可以轻松地在不同环境间切换，而无需修改代码。

Juice 将根据 ``environments`` 的 ``default`` 属性来确定默认加载的环境配置。

配置示例
~~~~~~~~~~~~~~

以下示例展示了一个典型的多环境配置：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">
            <!-- 生产环境配置 -->
            <environment id="prod">
                <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
                <driver>mysql</driver>
                <maxIdleConns>10</maxIdleConns>
                <maxOpenConns>100</maxOpenConns>
                <connMaxLifetime>3600</connMaxLifetime>
            </environment>

            <!-- 开发环境配置 -->
            <environment id="dev">
                <dataSource>./foo.db</dataSource>
                <driver>sqlite3</driver>
            </environment>
        </environments>
    </configuration>

配置说明
~~~~~~~~~~~~~~

每个环境配置都包含以下必要元素：

- ``id``: 环境的唯一标识符
- ``dataSource``: 数据库连接字符串
- ``driver``: 数据库驱动名称

可选配置项包括：

- ``maxIdleConns``: 最大空闲连接数
- ``maxOpenConns``: 最大打开连接数
- ``connMaxLifetime``: 连接最大生命周期（秒）
- ``connMaxIdleTime``: 空闲连接最大生命周期（秒）

.. attention::
    **重要提示：**

    1. ``environments`` 的 ``default`` 属性是必须的，它指定了默认加载的环境配置
    2. 每个 ``environment`` 的 ``id`` 属性必须唯一
    3. 在默认情况下，Juice 只会连接 ``default`` 属性指定的环境

代码实现
~~~~~~~~~~~~~~

以下示例展示了如何在代码中使用环境配置：

.. code-block:: go

    package main

    import (
        "fmt"
        "github.com/go-juicedev/juice"
        _ "github.com/go-sql-driver/mysql"
    )

    func main() {
        // 加载配置文件
        cfg, err := juice.NewXMLConfiguration("config.xml")
        if err != nil {
            fmt.Printf("配置加载失败: %v\n", err)
            return
        }

        // 初始化引擎
        engine, err := juice.Default(cfg)
        if err != nil {
            fmt.Printf("引擎初始化失败: %v\n", err)
            return
        }
        defer engine.Close() // 确保资源正确释放

        // 验证数据库连接
        if err = engine.DB().Ping(); err != nil {
            fmt.Printf("数据库连接失败: %v\n", err)
            return
        }

        fmt.Println("数据库连接成功")
    }



数据源切换
----------------

动态切换机制
~~~~~~~~~~

默认情况下，Juice 只会连接 ``environments`` 中 ``default`` 属性指定的数据源。但在多数据源场景下，Juice 提供了灵活的数据源切换机制。

配置示例
~~~~~~~~~

以下示例展示了一个包含主从数据源的配置：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="master">
            <!-- 主库配置 -->
            <environment id="master">
                <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
                <driver>mysql</driver>
            </environment>

            <!-- 从库1配置 -->
            <environment id="slave1">
                <dataSource>root:qwe123@tcp(localhost:3307)/database</dataSource>
                <driver>mysql</driver>
            </environment>

            <!-- 从库2配置 -->
            <environment id="slave2">
                <dataSource>root:qwe123@tcp(localhost:3308)/database</dataSource>
                <driver>mysql</driver>
            </environment>
        </environments>
    </configuration>

在这个配置中，我们定义了一个主库（master）和两个从库（slave1, slave2），并将 ``master`` 设置为默认数据源。

手动切换数据源
~~~~~~~~~~~~

Juice 提供了 ``With`` 方法用于在运行时切换数据源：

.. code-block:: go

    // 初始化引擎
    engine, _ := juice.New(cfg)

    fmt.Println("默认数据源:", engine.EnvID())

    // 切换到 slave1 数据源
    slave1Engine, err := engine.With("slave1")
    
    fmt.Println("切换到 slave1 数据源:", slave1Engine.EnvID())

.. note::
    ``With`` 方法会返回一个新的 Engine 实例，原有的 Engine 实例不会受到影响。这种设计确保了数据源切换的安全性和隔离性。


配置值提供器（Provider）
----------------

动态配置机制
~~~~~~~~~~

Juice 提供了灵活的配置值提供器机制，使开发者能够动态加载数据库连接信息，而不是将其硬编码在配置文件中。这对于管理敏感信息和支持不同部署环境特别有用。

环境变量提供器
~~~~~~~~~~~~

Juice 默认提供了环境变量提供器（env），用于从系统环境变量中获取配置值：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">
            <environment id="prod" provider="env">
                <dataSource>${DATA_SOURCE}</dataSource>
                <driver>mysql</driver>
            </environment>
        </environments>
    </configuration>

自定义提供器（EnvValueProvider）
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

开发者可以实现自己的配置值提供器，只需实现 ``EnvValueProvider`` 接口：

.. code-block:: go

    // EnvValueProvider 定义了配置值提供器接口
    type EnvValueProvider interface {
        Get(key string) (string, error)
    }

    // RegisterEnvValueProvider 注册自定义的配置值提供器
    // name: 提供器名称，对应 XML 中的 provider 属性
    // provider: 提供器实现
    func RegisterEnvValueProvider(name string, provider EnvValueProvider)

默认环境变量提供器实现
~~~~~~~~~~~~~~~~~~

以下是 Juice 默认环境变量提供器的实现：

.. code-block:: go

    var formatRegexp = regexp.MustCompile(`\$\{ *?([a-zA-Z0-9_\.]+) *?\}`)

    type OsEnvValueProvider struct{}

    func (p OsEnvValueProvider) Get(key string) (string, error) {
        var err error
        key = formatRegexp.ReplaceAllStringFunc(key, func(find string) string {
            value := os.Getenv(formatRegexp.FindStringSubmatch(find)[1])
            if len(value) == 0 {
                err = fmt.Errorf("environment variable %s not found", find)
            }
            return value
        })
        return key, err
    }

它可以在配置文件中使用 ``${}`` 语法来获取环境变量值。


连接池配置
----------------

Juice 提供了全面的连接池配置选项，用于优化数据库连接管理：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">
            <environment id="prod">
                <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
                <driver>mysql</driver>
                <maxIdleConnNum>10</maxIdleConnNum>
                <maxOpenConnNum>10</maxOpenConnNum>
                <maxConnLifetime>3600</maxConnLifetime>
                <maxIdleConnLifetime>3600</maxIdleConnLifetime>
            </environment>
        </environments>
    </configuration>

连接池参数说明：

- ``maxIdleConnNum``: 最大空闲连接数
- ``maxOpenConnNum``: 最大打开连接数
- ``maxConnLifetime``: 连接最大生命周期（秒）
- ``maxIdleConnLifetime``: 空闲连接最大生命周期（秒）

全局设置（Settings）
--------------------

``settings`` 标签用于配置 Juice 的全局行为：

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <settings>
            <setting name="debug" value="false"/>
        </settings>
    </configuration>

``settings`` 特性：

- 可选配置，可以完全不设置
- 支持多个 ``setting`` 子标签
- 每个 ``setting`` 必须包含 ``name`` 属性
- ``value`` 属性可选
- 配置值可被中间件或其他组件使用

例如，``debug`` 设置被 ``DebugMiddleware`` 用于控制调试模式的开启与关闭。


