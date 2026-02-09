事务管理
========

概述
----

事务用于保证一组数据库操作的原子性、一致性、隔离性和持久性。Juice 提供两套事务使用方式：

1. 手动事务（``engine.Tx()`` / ``engine.ContextTx(...)``）
2. 函数式事务（``juice.Transaction(...)`` / ``juice.NestedTransaction(...)``）

事务接口
----------------

Juice 的事务相关核心接口如下：

.. code-block:: go

    type Manager interface {
        Object(v any) SQLRowsExecutor
    }

    type TxManager interface {
        Manager
        Begin() error
        Commit() error
        Rollback() error
    }

手动事务
----------------

适合你需要显式控制 ``Begin/Commit/Rollback`` 的场景：

.. code-block:: go

    tx := engine.Tx()
    if err := tx.Begin(); err != nil {
        return err
    }
    defer tx.Rollback()

    if _, err := tx.Object(Repo{}.CreateUser).ExecContext(ctx, user); err != nil {
        return err
    }

    if _, err := tx.Object(Repo{}.CreateOrder).ExecContext(ctx, order); err != nil {
        return err
    }

    return tx.Commit()

.. note::

    建议始终使用 ``defer tx.Rollback()`` 作为兜底，成功路径再执行 ``tx.Commit()``。

函数式事务
----------------

函数式事务会在回调中自动注入事务 manager，适合 service 层封装：

.. code-block:: go

    baseCtx := juice.ContextWithManager(context.Background(), engine)

    err := juice.Transaction(baseCtx, func(ctx context.Context) error {
        repo := NewUserRepository()
        _, err := repo.CreateUser(ctx, user)
        return err
    },
        tx.WithIsolationLevel(sql.LevelReadCommitted),
        tx.WithReadOnly(false),
    )

    if err != nil {
        return err
    }

``Transaction`` 的行为是：回调返回 ``nil`` 时提交，返回非 ``nil`` 时回滚。

嵌套调用语义
----------------

``NestedTransaction`` 的语义是“**已在事务中则复用当前事务，否则新开事务**”：

.. code-block:: go

    err := juice.Transaction(baseCtx, func(ctx context.Context) error {
        if err := serviceA(ctx); err != nil {
            return err
        }

        return juice.NestedTransaction(ctx, func(ctx context.Context) error {
            return serviceB(ctx)
        })
    })

.. attention::

    ``NestedTransaction`` 不是数据库 savepoint 语义；它不会自动创建独立的内层提交点。

隔离级别与只读选项
----------------------

你可以在事务开启时指定隔离级别和只读属性：

.. code-block:: go

    err := juice.Transaction(baseCtx, handler,
        tx.WithIsolationLevel(sql.LevelSerializable),
        tx.WithReadOnly(true),
    )

这些选项与 ``database/sql`` 的 ``sql.TxOptions`` 对齐。

延伸阅读
----------------

- :doc:`tx_semantics`
- :doc:`multi_source_tx`
