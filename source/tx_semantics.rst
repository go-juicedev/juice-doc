事务语义对照表
================

概览
----------------

本页聚焦 Juice 当前事务 API 的**行为语义**，帮助你在 service 设计时快速选型。

术语说明：

- **手动事务**：``engine.Tx()`` / ``engine.ContextTx(...)`` + ``Begin/Commit/Rollback``。
- **函数式事务**：``juice.Transaction(ctx, manager, handler, opts...)``。
- **transaction-scoped manager**：``Transaction`` 回调中传给 ``handler`` 的 ``juice.Manager``，只能访问当前事务 session。

语义对照表
----------------

.. list-table::
   :header-rows: 1
   :widths: 18 18 22 22 20

   * - API
     - 启动条件
     - 成功时行为
     - 失败时行为
     - 典型场景
   * - ``engine.Tx()`` + ``Begin``
     - 需要手动调用 ``Begin``
     - 显式 ``Commit`` 后提交
     - 显式 ``Rollback`` 或返回错误后回滚
     - 底层库/基础设施层，细粒度控制
   * - ``engine.ContextTx(ctx, opts)``
     - 与上面一致，但可传 ``sql.TxOptions``
     - 与上面一致
     - 与上面一致
     - 指定隔离级别、只读事务
   * - ``juice.Transaction(ctx, engine, handler, opts...)``
     - ``manager`` 必须是 ``*juice.Engine``
     - ``handler`` 返回 ``nil`` 则提交
     - ``handler`` 返回非 ``nil`` 则回滚
     - service 层统一事务边界
   * - ``juice.Transaction(ctx, scopedManager, handler)``
     - ``scopedManager`` 来自外层 ``Transaction`` 回调
     - 直接复用外层事务并执行 ``handler``
     - 错误向外层冒泡
     - 组合 service、避免重复开启事务

行为细节
----------------

**1) ``Transaction`` 的 manager 参数**

``juice.Transaction`` 会检查传入的 manager：

- ``*juice.Engine``：开启新事务，并应用 ``opts``。
- transaction-scoped manager：直接复用已有事务，并忽略本次传入的 ``opts``。
- 其他类型或 ``nil``：返回 ``juice.ErrInvalidManager``。

常见错误：

- 未初始化 engine 时传入 ``nil``。
- 把非 Juice manager 的实现传入 ``Transaction``。
- 期望内层 ``Transaction`` 创建 savepoint，而实际它只是复用当前事务。

推荐：

- 外层入口传入 ``*juice.Engine``。
- 内层复用传入回调中的 transaction-scoped manager。

**2) 复用事务不是 savepoint**

向 ``Transaction`` 传入 transaction-scoped manager 的语义是“有事务就加入”，不是数据库 ``SAVEPOINT``。

这意味着：

- 复用外层事务时，不会产生独立的“内层提交点”。
- 内层失败会影响外层是否提交（通常应向上返回错误）。

**3) 特殊错误 ``tx.ErrCommitOnSpecific``**

当 ``handler`` 返回 ``tx.ErrCommitOnSpecific`` 时，事务仍会尝试提交，并将该错误与提交错误（如果存在）一起返回。

这用于“需要显式标记某类提交路径”的特殊场景；一般业务代码不建议常态化使用。

实战选择建议
----------------

- 需要完全可控的生命周期：选**手动事务**。
- 以业务函数为边界：优先**函数式事务**。
- service A 调 service B，且都可能独立调用：外层 ``Transaction`` + 内层再次调用 ``Transaction`` 复用 transaction-scoped manager。
- 如果你需要 savepoint 级别的细粒度语义：建议在业务侧按数据库能力自行封装。
