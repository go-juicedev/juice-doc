事务语义对照表
================

概览
----------------

本页聚焦 Juice 当前事务 API 的**行为语义**，帮助你在 service 设计时快速选型。

术语说明：

- **手动事务**：``engine.Tx()`` / ``engine.ContextTx(...)`` + ``Begin/Commit/Rollback``。
- **函数式事务**：``juice.Transaction(...)`` / ``juice.NestedTransaction(...)``。
- **当前事务上下文**：``ctx`` 里 manager 已是 ``TxManager``。

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
   * - ``juice.Transaction(ctx, handler, opts...)``
     - ``ctx`` 必须携带 ``*juice.Engine``
     - ``handler`` 返回 ``nil`` 则提交
     - ``handler`` 返回非 ``nil`` 则回滚
     - service 层统一事务边界
   * - ``juice.NestedTransaction(ctx, handler, opts...)``
     - 若当前已在事务中则复用；否则新开事务
     - 复用时由外层统一提交；新开时按 ``Transaction`` 规则
     - 复用时错误向外层冒泡；新开时失败回滚
     - 组合 service、避免重复开启事务

行为细节
----------------

**1) ``Transaction`` 的上下文要求**

``juice.Transaction`` 会从 ``ctx`` 取 manager，并要求它是 ``*juice.Engine``。如果不是，会返回错误。

常见错误：

- ``ctx`` 没有通过 ``juice.ContextWithManager`` 注入 manager。
- 把一个已处于事务中的 ``ctx`` 直接再次传给 ``Transaction``（此时 manager 往往不是 ``*juice.Engine``）。

推荐：

- 外层入口使用 ``Transaction``。
- 内层复用使用 ``NestedTransaction``。

**2) ``NestedTransaction`` 不是 savepoint**

``NestedTransaction`` 的语义是“有事务就加入，没有就创建”，不是数据库 ``SAVEPOINT``。

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
- service A 调 service B，且都可能独立调用：外层 ``Transaction`` + 内层 ``NestedTransaction``。
- 如果你需要 savepoint 级别的细粒度语义：建议在业务侧按数据库能力自行封装。
