事务管理
========

概述
----

事务是数据库操作的基本单位，用于保证数据的一致性和完整性。Juice 提供了完整的事务支持，包括基本事务操作、嵌套事务和隔离级别控制。

事务接口
-------

Juice 定义了两个核心接口来处理事务：

.. code-block:: go

    // Manager 接口定义了基本的数据库操作
    type Manager interface {
        Object(v any) Executor
    }

    // TxManager 接口扩展了 Manager，添加了事务控制方法
    type TxManager interface {
        Manager
        Begin() error
        Commit() error
        Rollback() error
    }

基本事务操作
----------

示例代码展示了如何使用事务：

.. code-block:: go

    engine, err := juice.Default(cfg)
    if err != nil {
        panic(err)
    }

    // 开启事务
    tx := engine.Tx()
    if err := tx.Begin(); err != nil {
        panic(err)
    }

    // 确保事务最终会被回滚或提交
    defer tx.Rollback()

    // 事务内的操作
    {
        // 查询操作
        result1, err := tx.Object("QueryUser").
            QueryContext(context.TODO(), nil)
        if err != nil {
            return err
        }

        // 使用泛型管理器
        result2, err := juice.NewGenericManager[User](tx).
            Object("CreateUser").
            QueryContext(context.TODO(), param)
        if err != nil {
            return err
        }
    }

    // 提交事务
    return tx.Commit()

.. note::
    事务使用建议：

    1. 总是使用 defer tx.Rollback()
    2. 在提交前检查所有错误
    3. 事务完成后不要再使用事务对象

嵌套事务
-------

Juice 支持嵌套事务，但需要注意正确管理：

.. code-block:: go

    tx1 := engine.Tx()
    if err := tx1.Begin(); err != nil {
        return err
    }
    defer tx1.Rollback()

    // 嵌套事务
    tx2 := engine.Tx()
    if err := tx2.Begin(); err != nil {
        return err
    }
    defer tx2.Rollback()

    // 内层事务操作
    if err := tx2.Commit(); err != nil {
        return err
    }

    // 外层事务操作
    return tx1.Commit()

.. attention::
    嵌套事务注意事项：

    1. 每个事务对象都需要正确关闭
    2. 遵循先开启后关闭的原则
    3. 注意事务之间的依赖关系

隔离级别控制
----------

Juice 支持完整的事务隔离级别控制，与 ``database/sql`` 包保持一致：

.. code-block:: go

    // 支持的隔离级别
    const (
        LevelDefault         sql.IsolationLevel = iota
        LevelReadUncommitted
        LevelReadCommitted
        LevelWriteCommitted
        LevelRepeatableRead
        LevelSnapshot
        LevelSerializable
        LevelLinearizable
    )

使用示例：

.. code-block:: go

    // 使用特定隔离级别开启事务
    tx := engine.ContextTx(ctx, &sql.TxOptions{
        Isolation: sql.LevelSerializable,
        ReadOnly:  false,
    })
    if err := tx.Begin(); err != nil {
        return err
    }
    defer tx.Rollback()

    // 事务操作...

    return tx.Commit()

隔离级别说明：

1. **LevelReadUncommitted**：
   - 最低隔离级别
   - 允许脏读
   - 性能最好

2. **LevelReadCommitted**：
   - 防止脏读
   - 允许不可重复读
   - 常用默认级别

3. **LevelRepeatableRead**：
   - 防止脏读和不可重复读
   - 允许幻读
   - 提供较好的一致性

4. **LevelSerializable**：
   - 最高隔离级别
   - 完全串行化
   - 性能最差但最安全

.. tip::
    选择隔离级别建议：

    1. 默认使用数据库的默认隔离级别
    2. 根据业务需求选择合适的级别
    3. 在性能和一致性之间找到平衡
    4. 注意不同数据库对隔离级别的具体实现可能不同