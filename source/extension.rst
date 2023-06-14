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
        "github.com/eatmoreapple/juice"
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
        "github.com/eatmoreapple/juice"
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

juice 没有提供这样的功能，可能以后支持。

但是可以给想要有这样需求的老表提供思路。

还是记得我们的提供的中间件的支持吗？

.. code-block:: go

    // Middleware is a wrapper of QueryHandler and ExecHandler.
    type Middleware interface {
        // QueryContext wraps the QueryHandler.
        QueryContext(stmt *Statement, next QueryHandler) QueryHandler
        // ExecContext wraps the ExecHandler.
        ExecContext(stmt *Statement, next ExecHandler) ExecHandler
    }

下面写一个伪代码

.. code-block:: go

    type ReadWriteMiddleware struct {
        slaves []*sql.DB
        master *sql.DB
    }

    func (r ReadWriteMiddleware) QueryContext(_ *juice.Statement, next juice.QueryHandler) juice.QueryHandler {
        return func(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
            // 随机选择一个
            index := rand.Intn(len(r.slaves))
            db := r.slaves[index]
            ctx = juice.WithSession(ctx, db)
            return next(ctx, query, args...)
        }
    }

    func (r ReadWriteMiddleware) ExecContext(stmt *juice.Statement, next juice.ExecHandler) juice.ExecHandler {
        return func(ctx context.Context, query string, args ...any) (sql.Result, error) {
            ctx = juice.WithSession(ctx, r.master)
            return next(ctx, query, args...)
        }
    }

.. attention::

    注意：上面的中间件的实现会覆盖所有的session，如果当前的session是一个事务，那么会导致事务的操作失效。