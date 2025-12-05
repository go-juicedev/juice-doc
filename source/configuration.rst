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




连接池调优指南
--------------------

连接池是数据库应用性能的关键因素。合理的连接池配置可以显著提升应用性能和稳定性。

调优原则
~~~~~~~~~~~~~~

1. **根据实际负载调整**
   
   不同的应用场景需要不同的连接池配置：
   
   - Web 应用：高并发，需要较大的连接池
   - 批处理任务：低并发，小连接池即可
   - 微服务：根据服务规模和调用频率调整

2. **避免过度配置**
   
   连接池过大会带来问题：
   
   - 占用过多数据库资源
   - 增加数据库服务器负担
   - 浪费应用服务器内存

3. **监控和调整**
   
   持续监控以下指标：
   
   - 连接池使用率
   - 等待连接的时间
   - 连接创建和销毁频率
   - 数据库服务器负载

不同场景的推荐配置
~~~~~~~~~~~~~~~~~~

**Web 应用（高并发）**

.. code-block:: xml

    <environment id="web-prod">
        <dataSource>root:password@tcp(localhost:3306)/database</dataSource>
        <driver>mysql</driver>
        <!-- 最大打开连接数：根据并发量设置 -->
        <maxOpenConnNum>200</maxOpenConnNum>
        <!-- 最大空闲连接数：通常设置为 maxOpenConnNum 的 25%-50% -->
        <maxIdleConnNum>50</maxIdleConnNum>
        <!-- 连接最大生命周期：30分钟 -->
        <maxConnLifetime>1800</maxConnLifetime>
        <!-- 空闲连接最大生命周期：10分钟 -->
        <maxIdleConnLifetime>600</maxIdleConnLifetime>
    </environment>

**批处理任务（低并发，长时间运行）**

.. code-block:: xml

    <environment id="batch">
        <dataSource>root:password@tcp(localhost:3306)/database</dataSource>
        <driver>mysql</driver>
        <!-- 批处理通常并发较低 -->
        <maxOpenConnNum>20</maxOpenConnNum>
        <maxIdleConnNum>5</maxIdleConnNum>
        <!-- 长时间运行的任务，连接生命周期可以设置更长 -->
        <maxConnLifetime>7200</maxConnLifetime>
        <maxIdleConnLifetime>3600</maxIdleConnLifetime>
    </environment>

**微服务（中等并发）**

.. code-block:: xml

    <environment id="microservice">
        <dataSource>root:password@tcp(localhost:3306)/database</dataSource>
        <driver>mysql</driver>
        <!-- 微服务通常需要快速响应 -->
        <maxOpenConnNum>50</maxOpenConnNum>
        <maxIdleConnNum>10</maxIdleConnNum>
        <!-- 较短的生命周期，快速释放资源 -->
        <maxConnLifetime>900</maxConnLifetime>
        <maxIdleConnLifetime>300</maxIdleConnLifetime>
    </environment>

**开发环境**

.. code-block:: xml

    <environment id="dev">
        <dataSource>./dev.db</dataSource>
        <driver>sqlite3</driver>
        <!-- 开发环境保持简单配置 -->
        <maxOpenConnNum>10</maxOpenConnNum>
        <maxIdleConnNum>2</maxIdleConnNum>
        <maxConnLifetime>3600</maxConnLifetime>
    </environment>

配置参数详解
~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: 25 15 60

   * - 参数名
     - 默认值
     - 说明与建议
   * - maxOpenConnNum
     - 无限制
     - **最大打开连接数**
       
       - 限制同时打开的数据库连接总数
       - 建议值：根据数据库服务器性能和应用并发量设置
       - Web应用：50-200，批处理：10-50
       - 设置过大会占用过多数据库资源
   * - maxIdleConnNum
     - 2
     - **最大空闲连接数**
       
       - 保持在连接池中的空闲连接数
       - 建议值：maxOpenConnNum 的 25%-50%
       - 设置过小会频繁创建/销毁连接
       - 设置过大会浪费资源
   * - maxConnLifetime
     - 永久
     - **连接最大生命周期（秒）**
       
       - 连接从创建到强制关闭的最长时间
       - 建议值：1800-7200（30分钟-2小时）
       - 防止长时间连接导致的问题
       - 0 表示永不过期（不推荐）
   * - maxIdleConnLifetime
     - 永久
     - **空闲连接最大生命周期（秒）**
       
       - 空闲连接保持的最长时间
       - 建议值：300-3600（5分钟-1小时）
       - 应小于 maxConnLifetime
       - 及时释放不活跃的连接

计算连接池大小
~~~~~~~~~~~~~~

**基本公式**

.. code-block:: text

    maxOpenConnNum = (核心线程数 × 2) + 有效磁盘数

    或者

    maxOpenConnNum = 并发请求数 × 单个请求平均持有连接时间 / 请求间隔时间

**示例计算**

假设你的应用：

- 部署在 4 核 CPU 的服务器上
- 使用 SSD 存储（算作 1 个有效磁盘）
- 预期并发请求：100 QPS
- 每个请求平均持有连接：50ms
- 请求间隔：10ms

方法1：``maxOpenConnNum = (4 × 2) + 1 = 9`` （保守估计）

方法2：``maxOpenConnNum = 100 × 0.05 / 0.01 = 500`` （理论最大值）

**实际建议**：从较小值开始（如 50），通过监控逐步调整到最优值。

性能监控
~~~~~~~~~~~~~~

**监控指标**

.. code-block:: go

    // 获取连接池统计信息
    stats := engine.DB().Stats()

    fmt.Printf("最大打开连接数: %d\n", stats.MaxOpenConnections)
    fmt.Printf("当前打开连接数: %d\n", stats.OpenConnections)
    fmt.Printf("使用中的连接数: %d\n", stats.InUse)
    fmt.Printf("空闲连接数: %d\n", stats.Idle)
    fmt.Printf("等待连接的请求数: %d\n", stats.WaitCount)
    fmt.Printf("等待连接的总时间: %v\n", stats.WaitDuration)
    fmt.Printf("关闭的最大空闲连接数: %d\n", stats.MaxIdleClosed)
    fmt.Printf("关闭的最大生命周期连接数: %d\n", stats.MaxLifetimeClosed)

**监控中间件示例**

.. code-block:: go

    type ConnectionPoolMonitor struct {
        interval time.Duration
    }

    func (m *ConnectionPoolMonitor) Start(engine *juice.Engine) {
        ticker := time.NewTicker(m.interval)
        go func() {
            for range ticker.C {
                stats := engine.DB().Stats()
                
                // 检查连接池使用率
                usage := float64(stats.InUse) / float64(stats.MaxOpenConnections) * 100
                if usage > 80 {
                    log.Printf("[WARNING] 连接池使用率过高: %.2f%%", usage)
                }
                
                // 检查等待时间
                if stats.WaitCount > 0 {
                    avgWait := stats.WaitDuration / time.Duration(stats.WaitCount)
                    if avgWait > 100*time.Millisecond {
                        log.Printf("[WARNING] 平均等待连接时间过长: %v", avgWait)
                    }
                }
            }
        }()
    }

常见问题排查
~~~~~~~~~~~~~~

**问题1：连接池耗尽**

症状：
  - 应用响应变慢
  - 大量请求等待数据库连接
  - ``stats.WaitCount`` 持续增长

解决方案：
  1. 增加 ``maxOpenConnNum``
  2. 检查是否有连接泄漏（未正确关闭）
  3. 优化慢查询，减少连接占用时间
  4. 考虑使用连接池监控

**问题2：连接频繁创建/销毁**

症状：
  - ``stats.MaxIdleClosed`` 快速增长
  - CPU 使用率波动
  - 数据库连接数波动大

解决方案：
  1. 增加 ``maxIdleConnNum``
  2. 延长 ``maxIdleConnLifetime``
  3. 评估是否需要预热连接池

**问题3：数据库连接超时**

症状：
  - 出现 "connection timeout" 错误
  - 长时间运行后连接失败

解决方案：
  1. 设置合理的 ``maxConnLifetime``
  2. 确保小于数据库服务器的超时设置
  3. 实现连接健康检查

**问题4：内存占用过高**

症状：
  - 应用内存持续增长
  - 空闲连接数过多

解决方案：
  1. 减少 ``maxIdleConnNum``
  2. 缩短 ``maxIdleConnLifetime``
  3. 检查是否有连接泄漏

最佳实践
~~~~~~~~~~~~~~

**1. 连接池预热**

.. code-block:: go

    func warmupConnectionPool(engine *juice.Engine, size int) error {
        db := engine.DB()
        
        // 创建多个连接
        var conns []*sql.Conn
        for i := 0; i < size; i++ {
            conn, err := db.Conn(context.Background())
            if err != nil {
                return err
            }
            conns = append(conns, conn)
        }
        
        // 执行简单查询确保连接可用
        for _, conn := range conns {
            if err := conn.PingContext(context.Background()); err != nil {
                return err
            }
        }
        
        // 释放连接回连接池
        for _, conn := range conns {
            conn.Close()
        }
        
        return nil
    }

**2. 连接健康检查**

.. code-block:: go

    func healthCheck(engine *juice.Engine) error {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        
        if err := engine.DB().PingContext(ctx); err != nil {
            return fmt.Errorf("数据库健康检查失败: %w", err)
        }
        
        return nil
    }

**3. 优雅关闭**

.. code-block:: go

    func gracefulShutdown(engine *juice.Engine) {
        // 停止接受新请求
        // ...
        
        // 等待现有请求完成
        time.Sleep(5 * time.Second)
        
        // 关闭连接池
        if err := engine.Close(); err != nil {
            log.Printf("关闭连接池失败: %v", err)
        }
    }

**4. 环境隔离**

.. code-block:: xml

    <configuration>
        <environments default="prod">
            <!-- 生产环境：高性能配置 -->
            <environment id="prod">
                <maxOpenConnNum>200</maxOpenConnNum>
                <maxIdleConnNum>50</maxIdleConnNum>
            </environment>
            
            <!-- 测试环境：中等配置 -->
            <environment id="test">
                <maxOpenConnNum>50</maxOpenConnNum>
                <maxIdleConnNum>10</maxIdleConnNum>
            </environment>
            
            <!-- 开发环境：最小配置 -->
            <environment id="dev">
                <maxOpenConnNum>10</maxOpenConnNum>
                <maxIdleConnNum>2</maxIdleConnNum>
            </environment>
        </environments>
    </configuration>

**5. 监控告警**

建议监控以下指标并设置告警：

- 连接池使用率 > 80%
- 平均等待连接时间 > 100ms
- 连接创建失败率 > 1%
- 空闲连接数 < 配置值的 20%

配置检查清单
~~~~~~~~~~~~~~

在部署到生产环境前，请检查：

.. code-block:: text

    ☐ maxOpenConnNum 是否根据实际负载设置？
    ☐ maxIdleConnNum 是否为 maxOpenConnNum 的 25%-50%？
    ☐ maxConnLifetime 是否小于数据库服务器超时设置？
    ☐ maxIdleConnLifetime 是否小于 maxConnLifetime？
    ☐ 是否实现了连接池监控？
    ☐ 是否设置了告警阈值？
    ☐ 是否进行了压力测试？
    ☐ 是否有连接池预热机制？
    ☐ 是否实现了优雅关闭？
    ☐ 是否区分了不同环境的配置？

.. tip::
    **调优建议**：
    
    1. 从保守的配置开始（小连接池）
    2. 通过监控收集实际数据
    3. 逐步调整到最优值
    4. 定期review和调整配置
    5. 记录每次调整的原因和效果

.. warning::
    **常见误区**：
    
    - ❌ 连接池越大越好
    - ❌ 所有环境使用相同配置
    - ❌ 设置后就不再调整
    - ❌ 忽略监控和告警
    - ❌ 不考虑数据库服务器限制
