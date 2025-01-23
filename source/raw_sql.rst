原始 SQL 执行
============

概述
----
在某些场景下，我们可能需要直接执行 SQL 语句而不是通过 XML 配置。Juice 提供了简单的 API 来支持这种需求。

基础用法
--------
最简单的方式是使用 ``engine.Raw()`` 方法：

.. code-block:: go

    var engine *juice.Engine

    // 执行查询并获取结果
    rows, err := engine.Raw("SELECT * FROM user WHERE id = #{id}").
        Select(context.TODO(), juice.H{"id": 1})

结果集映射
---------
Juice 提供了多种方式来映射查询结果到 Go 结构体：

.. code-block:: go

    // 定义数据结构
    type User struct {
        ID   int64  `column:"id"`
        Name string `column:"name"`
    }

    // 创建查询
    runner := engine.Raw("SELECT id, name FROM user WHERE id = #{id}")

    // 方式 1: 直接绑定到切片
    users, err := juice.NewGenericRunner[[]User](runner).
        Bind(context.TODO(), juice.H{"id": 1})
    // users 类型为 []User

    // 方式 2: 使用 List 方法
    users, err := juice.NewGenericRunner[User](runner).
        List(context.TODO(), juice.H{"id": 1})
    // users 类型为 []User

    // 方式 3: 使用 List2 方法（返回指针切片）
    users, err := juice.NewGenericRunner[User](runner).
        List2(context.TODO(), juice.H{"id": 1})
    // users 类型为 []*User

事务支持
--------
在事务中执行原始 SQL 同样简单：

.. code-block:: go

    var engine *juice.Engine

    // 开启事务
    tx := engine.Tx()
    if err := tx.Begin(); err != nil {
        // 处理错误
    }

    // 在事务中执行查询
    runner := tx.Raw("SELECT id, name FROM user WHERE id = #{id}")
    // 后续用法与非事务相同

    // 别忘了提交或回滚事务
    if err := tx.Commit(); err != nil {
        tx.Rollback()
    }

注意事项
--------
- 参数绑定使用 ``#{paramName}`` 语法
- 记得正确处理事务的提交和回滚


sql.DB 执行
---------

当 engine 成功初始化之后，可以通过 ``engine.DB()`` 获取到底层的 ``sql.DB`` 对象。

我们可以通过 ``DB.Exec()`` 或 ``DB.Query()`` 方法来执行 SQL 语句。

那么它跟上面的 ``engine.Raw()`` 方法有什么区别？


.. code-block:: go

    engine.DB().Query("SELECT id, name FROM user WHERE id = ?", 1)


.. code-block:: go

    engine.Raw("SELECT id, name FROM user WHERE id = {id}").Select(context.TODO(), juice.H{"id": 1})


- ``engine.Raw()`` 可以屏蔽底层驱动占位符的差异，而 ``DB.Exec()`` 和 ``DB.Query()`` 需要开发者手动指定占位符。

- ``engine.Raw()`` 会走中间件，而 ``DB.Exec()`` 和 ``DB.Query()`` 不会走。