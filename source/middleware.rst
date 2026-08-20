中间件
=========


什么是中间件
---------------

在 Juice 中，中间件用于拦截 SQL 执行链。它可以在真正访问数据库前后增加日志、超时控制、链路追踪、数据源路由等横切逻辑。

当前版本的核心接口如下：

.. code-block:: go

    type Handler[T any] func(ctx context.Context, query string, args ...any) (T, error)

    type QueryHandler = Handler[sql.Rows]
    type ExecHandler = Handler[sql.Result]

    type Middleware interface {
        QueryContext(ctx *StatementContext, next QueryHandler) QueryHandler
        ExecContext(ctx *StatementContext, next ExecHandler) ExecHandler
    }

``StatementContext`` 会携带当前执行所需的上下文信息：

.. code-block:: go

    type StatementContext struct {
        // 具体字段未导出，通过方法访问。
    }

    func (m *StatementContext) Engine() *Engine
    func (m *StatementContext) Statement() Statement
    func (m *StatementContext) Context() context.Context
    func (m *StatementContext) Param() eval.Param
    func (m *StatementContext) Session() session.Session
    func (m *StatementContext) WithSession(session session.Session)

``QueryContext`` 只会拦截查询类语句；``ExecContext`` 会拦截 ``insert``、``update``、``delete`` 和原始 SQL 的写操作。


注册与执行顺序
---------------

通过 ``engine.Use`` 注册中间件：

.. code-block:: go

    engine.Use(&TraceMiddleware{})
    engine.Use(&MetricsMiddleware{})

中间件按注册顺序组合，但**最后注册的中间件会最先执行**。如果按 ``A``、``B``、``C`` 的顺序注册，运行时顺序是：

.. code-block:: text

    C before -> B before -> A before -> database -> A after -> B after -> C after

``juice.New`` 不注册任何中间件。``juice.Default`` 会在 ``New`` 的基础上注册 ``DebugMiddleware``。


DebugMiddleware
---------------

``DebugMiddleware`` 用于打印 SQL、参数与执行耗时。

默认情况下，只要使用 ``juice.Default`` 初始化 engine，就会启用 ``DebugMiddleware``：

.. code-block:: go

    engine, err := juice.Default(cfg)

如果不希望打印 SQL，可以在全局 ``settings`` 中关闭：

.. code-block:: xml

    <settings>
        <setting name="debug" value="false"/>
    </settings>

也可以在单条语句上关闭：

.. code-block:: xml

    <select id="GetUser" debug="false">
        select * from user where id = #{id}
    </select>

判断优先级是：

1. 语句级 ``debug="false"`` 会关闭当前语句日志。
2. 全局 ``<setting name="debug" value="false"/>`` 会关闭全局日志。
3. 如果两者都没有显式关闭，则默认打印日志。


SQL 超时控制
-------------

当前版本不提供内置的 ``TimeoutMiddleware``。如果需要限制单条 SQL 执行时间，请在调用侧使用 ``context.WithTimeout`` 或
``context.WithDeadline``：

.. code-block:: go

    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel()

    rows, err := engine.Object("GetUser").QueryContext(ctx, juice.H{"id": 1})


TxSensitiveDataSourceSwitchMiddleware
-------------------------------------

``TxSensitiveDataSourceSwitchMiddleware`` 用于查询语句的数据源路由，常见用途是读写分离。

启用方式：

.. code-block:: go

    engine.Use(&juice.TxSensitiveDataSourceSwitchMiddleware{})

路由优先级：

1. ``select`` 语句上的 ``dataSource`` 属性。
2. 全局 ``settings`` 中的 ``selectDataSource``。
3. 未配置时不切换，继续使用当前 engine 的数据源。

支持的特殊值：

- ``?``：从所有已注册数据源中随机选择。
- ``?!``：从非当前默认数据源中随机选择；如果没有可用从库，则回退到当前数据源。
- 其他字符串：按具体环境 id 切换，例如 ``slave1``。

示例：

.. code-block:: xml

    <settings>
        <setting name="selectDataSource" value="?!"/>
    </settings>

    <select id="GetUser" dataSource="slave1">
        select * from user where id = #{id}
    </select>

该中间件是事务感知的：如果当前执行已经在事务中，它不会切换数据源，而是继续使用当前事务 session。


自定义中间件
-------------

自定义中间件只需要实现 ``Middleware`` 接口。

下面是一个简单的链路追踪示例：

.. code-block:: go

    type TraceMiddleware struct{}

    func (m TraceMiddleware) QueryContext(sc *juice.StatementContext, next juice.QueryHandler) juice.QueryHandler {
        stmt := sc.Statement()
        return func(ctx context.Context, query string, args ...any) (juiceSql.Rows, error) {
            trace.Log(ctx, "statement", stmt.ID().String())
            trace.Log(ctx, "query", query)
            return next(ctx, query, args...)
        }
    }

    func (m TraceMiddleware) ExecContext(sc *juice.StatementContext, next juice.ExecHandler) juice.ExecHandler {
        stmt := sc.Statement()
        return func(ctx context.Context, query string, args ...any) (juiceSql.Result, error) {
            trace.Log(ctx, "statement", stmt.ID().String())
            trace.Log(ctx, "exec", query)
            return next(ctx, query, args...)
        }
    }

上面的示例中，``juiceSql`` 是 ``github.com/go-juicedev/juice/sql`` 的导入别名。

注册方式：

.. code-block:: go

    engine.Use(TraceMiddleware{})


修改执行 Session
----------------

如果中间件需要把后续 SQL 路由到其他 session，可以通过 ``StatementContext.WithSession`` 替换当前执行链使用的 session。
内置的 ``TxSensitiveDataSourceSwitchMiddleware`` 就是通过这个机制在非事务查询中切换数据源。

一般业务中间件不需要修改 session；日志、指标、追踪、审计类中间件只要包裹 ``next`` 即可。
