多数据源 × 事务交互
======================

目标
----------------

本页说明在 Juice 中，**数据源切换（``engine.With(...)``）** 与 **事务（``Transaction/Tx``）** 如何组合，避免跨库事务误用。

核心结论
----------------

- ``engine.With("name")`` 会返回绑定到目标数据源的新 ``Engine`` 视图。
- ``juice.Transaction`` 的事务只覆盖**当前 engine 对应的数据源连接**。
- ``NestedTransaction`` 只处理“是否已在事务中”，不负责跨数据源一致性。
- Juice 不提供分布式事务（2PC/XA）抽象；跨库一致性建议由业务侧策略保证。

交互矩阵
----------------

.. list-table::
   :header-rows: 1
   :widths: 24 22 30 24

   * - 场景
     - 是否单事务覆盖
     - 风险
     - 建议
   * - 单一数据源内 ``Transaction``
     - 是
     - 风险低
     - 直接使用
   * - 事务外先 ``With("slave")`` 再 ``Transaction``
     - 是（仅该 slave）
     - 写入/只读职责混淆
     - 明确读写策略后使用
   * - 事务回调内临时切换到另一数据源执行
     - 否（通常变成两个独立事务域）
     - 数据不一致、部分提交
     - 避免；改为 saga/outbox
   * - 同请求内多次切换数据源并写入
     - 否
     - 无法原子提交
     - 拆分步骤并设计补偿

推荐模式
----------------

模式一：**先选数据源，再开事务**

.. code-block:: go

    base := juice.ContextWithManager(context.Background(), engine)

    writeEngine, err := engine.With("master")
    if err != nil {
        return err
    }

    ctx := juice.ContextWithManager(base, writeEngine)
    return juice.Transaction(ctx, func(ctx context.Context) error {
        _, err := repo.CreateOrder(ctx, req)
        return err
    })

模式二：**读写分离下，写路径固定主库事务**

- 查询可按策略走从库（无事务或只读事务）。
- 下单、扣减库存、记账等写路径统一走主库事务。

模式三：**跨数据源一致性用业务模式兜底**

可选策略：

- outbox + 异步投递
- saga（补偿事务）
- 幂等键 + 重试

反例（不推荐）
----------------

.. code-block:: go

    // 外层在 master 开事务
    _ = juice.Transaction(ctx, func(ctx context.Context) error {
        if _, err := repoA.WriteOnMaster(ctx, a); err != nil {
            return err
        }

        // 在同一回调里切到 slave/other 再写
        other, _ := engine.With("other")
        otherCtx := juice.ContextWithManager(ctx, other)
        _, err := repoB.WriteOnOther(otherCtx, b)
        return err
    })

上面代码通常不能保证两个写操作原子一致。

排障建议
----------------

- 若出现“部分成功部分失败”，先检查是否在一个业务动作里写了多个数据源。
- 若事务似乎“没生效”，检查调用链是否混入了另一个 ``engine.With(...)`` 的上下文。
- 在日志中打印 EnvID（若你在中间件里可拿到）有助于快速定位数据源漂移问题。
