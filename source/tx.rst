事务管理
========

概述
----

事务用于保证一组数据库操作的原子性、一致性、隔离性和持久性。Juice 提供两套事务使用方式：

1. 手动事务（``engine.Tx()`` / ``engine.ContextTx(...)``）
2. 函数式事务（``juice.Transaction(...)``）

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

函数式事务会在回调中传入事务 manager，适合 service 层封装：

.. code-block:: go

    err := juice.Transaction(ctx, engine, func(ctx context.Context, manager juice.Manager) error {
        _, err := manager.Object(Repo{}.CreateUser).ExecContext(ctx, user)
        return err
    },
        tx.WithIsolationLevel(sql.LevelReadCommitted),
        tx.WithReadOnly(false),
    )

    if err != nil {
        return err
    }

``Transaction`` 的行为是：回调返回 ``nil`` 时提交，返回非 ``nil`` 时回滚。

复用当前事务
----------------

内层需要复用外层事务时，可以再次调用 ``juice.Transaction``，并把回调收到的 transaction-scoped manager 作为 manager 参数传入：

.. code-block:: go

    err := juice.Transaction(ctx, engine, func(ctx context.Context, manager juice.Manager) error {
        if err := serviceA(ctx, manager); err != nil {
            return err
        }

        return juice.Transaction(ctx, manager, func(ctx context.Context, inner juice.Manager) error {
            return serviceB(ctx, inner)
        })
    })

.. attention::

    向 ``Transaction`` 传入 transaction-scoped manager 会复用当前事务，并忽略本次调用传入的 ``opts``；这不是数据库 savepoint 语义。

隔离级别与只读选项
----------------------

你可以在事务开启时指定隔离级别和只读属性：

.. code-block:: go

    err := juice.Transaction(ctx, engine, handler,
        tx.WithIsolationLevel(sql.LevelSerializable),
        tx.WithReadOnly(true),
    )

这些选项与 ``database/sql`` 的 ``sql.TxOptions`` 对齐。

延伸阅读
----------------

- :doc:`tx_semantics`
- :doc:`multi_source_tx`
