缓存机制
=========

事务级缓存
---------

Juice 提供了事务级别的查询缓存机制，可以显著提升同一事务中重复查询的性能。当开启缓存后，相同参数的查询在同一事务中只会实际执行一次。

开启缓存
--------

缓存功能默认是关闭的，需要通过 ``CacheTx`` 显式开启：

.. code-block:: go

    // 不使用缓存的事务
    tx := engine.Tx()
    defer tx.Rollback()

    // 使用缓存的事务
    cacheTx := engine.CacheTx()
    defer cacheTx.Rollback()

使用示例：

.. code-block:: go

    tx := engine.CacheTx()
    defer tx.Rollback()

    // 第一次查询，会访问数据库
    result1, _ := juice.NewGenericManager[int](tx).
        Object("QueryCount").
        QueryContext(context.Background(), nil)

    // 第二次查询，直接使用缓存
    result2, _ := juice.NewGenericManager[int](tx).
        Object("QueryCount").
        QueryContext(context.Background(), nil)

    tx.Commit()

.. note::
    使用 ``DebugMiddleware`` 可以观察到实际的SQL执行次数

缓存失效机制
-----------

缓存自动失效的场景：

1. **写操作触发**：
   - 执行非 ``select`` 操作时自动失效
   - 可通过 ``flushCache="false"`` 阻止失效

2. **事务结束**：
   - 事务提交（Commit）时失效
   - 事务回滚（Rollback）时失效

配置示例：

.. code-block:: xml

    <!-- 不触发缓存失效的更新操作 -->
    <update id="UpdateStatus" flushCache="false">
        UPDATE users SET status = #{status}
    </update>

自定义缓存实现
------------

Juice 支持自定义缓存存储实现：

.. code-block:: go

    // Cache 接口定义
    type Cache interface {
        // Set 设置缓存
        Set(ctx context.Context, key string, value any) error

        // Get 获取缓存，不存在返回 ErrCacheNotFound
        Get(ctx context.Context, key string, dst any) error

        // Flush 清空所有缓存
        Flush(ctx context.Context) error
    }

自定义缓存示例：

.. code-block:: go

    type MyCache struct {
        // 自定义字段
    }

    // 实现 Cache 接口
    func (c *MyCache) Set(ctx context.Context, key string, value any) error {
        // 实现存储逻辑
    }

    func (c *MyCache) Get(ctx context.Context, key string, dst any) error {
        // 实现获取逻辑
    }

    func (c *MyCache) Flush(ctx context.Context) error {
        // 实现清空逻辑
    }

    // 注册自定义缓存
    engine.SetCacheFactory(func() cache.Cache {
        return &MyCache{}  // 返回新的缓存实例
    })

.. attention::
    重要说明：

    1. 缓存功能仅在使用 ``NewGenericManager`` 时有效
    2. 自定义缓存实现必须是线程安全的
    3. 缓存工厂函数必须返回新的缓存实例

二级缓存
-------

.. note::
    二级缓存功能尚未实现，敬请期待。