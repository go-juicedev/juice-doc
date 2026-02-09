端到端最佳实践
================

适用场景
--------------------------------

本页给出一个从配置到调用的完整实践模板，适合中小型业务服务快速落地。

推荐目录结构
--------------------------------

.. code-block:: text

    .
    ├── cmd/server/main.go
    ├── internal/
    │   ├── app/
    │   │   └── bootstrap.go
    │   ├── repo/
    │   │   ├── user.go
    │   │   └── user_impl.go
    │   ├── service/
    │   │   └── user_service.go
    │   └── transport/http/
    │       └── handler.go
    ├── config/
    │   └── config.xml
    └── mapper/
        └── user_mapper.xml

配置建议
--------------------------------

- 在 ``config.xml`` 中明确 ``default`` 数据源。
- 读写分离时，约定 ``master`` 负责写，``slave`` 负责读。
- 统一连接池参数与超时策略（在 ``configuration`` 文档已有详细说明）。

启动与依赖注入
--------------------------------

.. code-block:: go

    func Bootstrap() (*juice.Engine, error) {
        cfg, err := juice.NewXMLConfiguration("config/config.xml")
        if err != nil {
            return nil, err
        }

        engine, err := juice.Default(cfg)
        if err != nil {
            return nil, err
        }

        // 可按需添加自定义中间件（脱敏、trace、慢查询告警等）
        // engine.Use(yourMiddleware)

        return engine, nil
    }

请求处理链路（推荐）
--------------------------------

1. HTTP 层做参数校验和鉴权。
2. service 层建立事务边界。
3. repo 层仅负责 mapper 调用与数据映射。
4. 错误统一转换为业务错误码。

.. code-block:: go

    func (s *UserService) CreateUser(ctx context.Context, req CreateUserReq) error {
        ctx = juice.ContextWithManager(ctx, s.engine)

        return juice.Transaction(ctx, func(ctx context.Context) error {
            if _, err := s.userRepo.Create(ctx, req.ToEntity()); err != nil {
                return err
            }
            return nil
        })
    }

读写分离实践
--------------------------------

- 写路径：使用 ``master`` engine 注入上下文并开启事务。
- 读路径：可使用 ``engine.With("slave")`` 单独查询（通常无需事务）。
- 避免在同一事务回调内切换到另一个数据源进行写入。

错误处理约定
--------------------------------

- repo 层：保留底层错误，必要时附加 SQL action 上下文。
- service 层：将技术错误映射为领域错误。
- transport 层：将领域错误映射为 HTTP/gRPC 响应。

可观测性建议
--------------------------------

- 开发环境启用 ``DebugMiddleware`` 便于排查。
- 生产环境建议：

  - SQL 日志脱敏
  - 慢查询阈值告警
  - 请求 ID 全链路传递

上线检查清单
--------------------------------

- mapper 与接口签名是否一一对应。
- 关键写路径是否都在事务边界内。
- 是否存在未受控 ``${}`` 动态拼接。
- 连接池参数是否按压测结果调优。
- 文档中的示例是否与当前 API 版本一致。
