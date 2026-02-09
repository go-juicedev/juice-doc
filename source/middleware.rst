中间件
=========


什么是中间件
---------------

在juice中，中间件是一个接口，接口的描述如下：

.. code:: go

    // QueryHandler defines the handler of the query.
    type QueryHandler func(ctx context.Context, query string, args ...any) (*sql.Rows, error)

    // ExecHandler defines the handler of the exec.
    type ExecHandler func(ctx context.Context, query string, args ...any) (sql.Result, error)

    // Middleware defines the interface for intercepting and processing SQL statement executions.
    // It implements the interceptor pattern, allowing cross-cutting concerns like logging, 
    // timeout management, and connection switching to be handled transparently.
    type Middleware interface {
    	// QueryContext intercepts and processes SELECT query executions.
    	// It receives the statement, configuration, and the next handler in the chain.
    	// Must return a QueryHandler that processes the actual query execution.
    	QueryContext(stmt Statement, configuration Configuration, next QueryHandler) QueryHandler
    	
    	// ExecContext intercepts and processes INSERT/UPDATE/DELETE executions.
    	// It receives the statement, configuration, and the next handler in the chain.
    	// Must return an ExecHandler that processes the actual execution.
    	ExecContext(stmt Statement, configuration Configuration, next ExecHandler) ExecHandler
    }

中间件的作用是在执行SQL语句之前，对SQL语句进行一些处理，比如SQL语句的日志记录，SQL语句的缓存等等。

当执行的是查询操作的时候，``QueryContext`` 将会被执行。否则执行 ``ExecContext``

juice中内置了一些中间件，比如：

- :class:`juice/middleware/DebugMiddleware`：用于打印SQL语句的中间件。

.. code:: go

    // logger is a default logger for debug.
    var logger = log.New(log.Writer(), "[juice] ", log.Flags())

    // DebugMiddleware is a middleware that logs SQL statements with their execution time and parameters.
    // It provides debugging capabilities by printing formatted SQL queries along with execution metrics.
    // The middleware can be enabled/disabled through statement attributes or global configuration settings.
    type DebugMiddleware struct{}

    // QueryContext implements Middleware.
    // QueryContext logs SQL SELECT statements with their execution time and parameters.
    // The logging includes statement ID, SQL query, arguments, and execution duration.
    // Logging is controlled by the debug mode setting from statement attributes or global configuration.
    func (m *DebugMiddleware) QueryContext(stmt Statement, configuration Configuration, next QueryHandler) QueryHandler {
    	if !m.isDeBugMode(stmt, configuration) {
    		return next
    	}
    	// wrapper QueryHandler
    	return func(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
    		start := time.Now()
    		rows, err := next(ctx, query, args...)
    		spent := time.Since(start)
    		logger.Printf("\x1b[33m[%s]\x1b[0m args: \u001B[34m%v\u001B[0m time: \u001B[31m%v\u001B[0m \x1b[32m%s\x1b[0m",
    			stmt.Name(), query, args, spent, query)
    		return rows, err
    	}
    }

    // ExecContext implements Middleware.
    // ExecContext logs SQL INSERT/UPDATE/DELETE statements with their execution time and parameters.
    // The logging includes statement ID, SQL query, arguments, and execution duration.
    // Logging is controlled by the debug mode setting from statement attributes or global configuration.
    func (m *DebugMiddleware) ExecContext(stmt Statement, configuration Configuration, next ExecHandler) ExecHandler {
    	if !m.isDeBugMode(stmt, configuration) {
    		return next
    	}
    	// wrapper ExecContext
    	return func(ctx context.Context, query string, args ...any) (sql.Result, error) {
    		start := time.Now()
    		rows, err := next(ctx, query, args...)
    		spent := time.Since(start)
    		logger.Printf("\x1b[33m[%s]\x1b[0m args: \u001B[34m%v\u001B[0m time: \u001B[31m%v\u001B[0m \x1b[32m%s\x1b[0m",
    			stmt.Name(), query, args, spent, query)
    		return rows, err
    	}
    }

    // isDeBugMode determines whether debug logging should be enabled for the given statement.
    // It checks debug settings in the following priority order:
    // 1. Statement-level "debug" attribute (if set to "false", disables debug)
    // 2. Global configuration "debug" setting (if set to "false", disables debug)
    // 3. Default is true (debug mode enabled) if neither is explicitly set to false
    //
    // Returns true if debug mode should be enabled, false otherwise.
    func (m *DebugMiddleware) isDeBugMode(stmt Statement, configuration Configuration) bool {
    	// try to get the debug mode from the Statement
    	debug := stmt.Attribute("debug")
    	// if the debug mode is not set, try to get the debug mode from the configuration
    	if debug == "false" {
    		return false
    	}
    	if configuration.Settings().Get("debug") == "false" {
    		return false
    	}
    	return true
    }

当你启用了这个中间件，juice会将每次执行的sql语句和参数写入到log包的默认的writer里面（默认是console），并且记录耗时。

当不想使用这个中间件的时候，可以在setting里面将debug设置为false, 这样就会全局关闭这个中间件。

.. code:: xml

    <settings>
        <setting name="debug" value="false"/>
    </settings>

当你想局部禁用这个功能的时候，可以在对应的action上面配置，如：

.. code:: xml

    <insert id="xxx" debug="false">
    </insert>


- :class:`juice/middleware/TimeoutMiddleware`：用于控制sql执行超时。

.. code-block:: go

    // TimeoutMiddleware is a middleware that manages query execution timeouts.
    // It sets context timeouts for SQL statements to prevent long-running queries from hanging.
    // The timeout value is obtained from the statement's "timeout" attribute and is specified in milliseconds.
    type TimeoutMiddleware struct{}

    // QueryContext implements Middleware.
    // QueryContext sets a context timeout for SELECT queries to prevent long-running operations.
    // The timeout value is obtained from the statement's "timeout" attribute.
    // If timeout is <= 0, no timeout is applied and the original handler is returned unchanged.
    func (t TimeoutMiddleware) QueryContext(stmt Statement, _ Configuration, next QueryHandler) QueryHandler {
    	timeout := t.getTimeout(stmt)
    	if timeout <= 0 {
    		return next
    	}
    	return func(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
    		ctx, cancel := context.WithTimeout(ctx, time.Duration(timeout)*time.Millisecond)
    		defer cancel()
    		return next(ctx, query, args...)
    	}
    }

    // ExecContext implements Middleware.
    // ExecContext sets a context timeout for INSERT/UPDATE/DELETE operations to prevent long-running operations.
    // The timeout value is obtained from the statement's "timeout" attribute.
    // If timeout is <= 0, no timeout is applied and the original handler is returned unchanged.
    func (t TimeoutMiddleware) ExecContext(stmt Statement, _ Configuration, next ExecHandler) ExecHandler {
    	timeout := t.getTimeout(stmt)
    	if timeout <= 0 {
    		return next
    	}
    	return func(ctx context.Context, query string, args ...any) (sql.Result, error) {
    		ctx, cancel := context.WithTimeout(ctx, time.Duration(timeout)*time.Millisecond)
    		defer cancel()
    		return next(ctx, query, args...)
    	}
    }

    // getTimeout retrieves the timeout value from the statement's "timeout" attribute.
    // Returns the timeout value in milliseconds, or 0 if not set or invalid.
    func (t TimeoutMiddleware) getTimeout(stmt Statement) (timeout int64) {
    	timeoutAttr := stmt.Attribute("timeout")
    	if timeoutAttr == "" {
    		return
    	}
    	timeout, _ = strconv.ParseInt(timeoutAttr, 10, 64)
    	return
    }

在对应action标签的属性上面加上timeout属性，即可启用这个功能，timeout的单位为毫秒，如：

.. code-block:: xml

    <insert id="xxx" timeout="1000">
    </insert>

.. attention::

	注意：TimeoutMiddleware是在go语言级别实现的超时，而不是数据库级别。

自定义中间件
-------------

自定义中间只需要实现 ``Middleware`` 接口, 然后注册入对应的engine即可，如：

.. code-block:: go

    func main() {
        var mymiddleware Middleware = yourMiddlewareImpl{}

        cfg, err := juice.NewXMLConfiguration("config.xml")
        if err != nil {
            panic(err)
        }

        engine, err := juice.Default(cfg)
        if err != nil {
            panic(err)
        }

        engine.Use(mymiddleware)
    }



