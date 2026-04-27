.. juice documentation master file, created by
   sphinx-quickstart on Sat Nov  5 19:15:50 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Juice 简介
==============================

juice 是一个基于 golang 的 sql mapper 框架，它的目标是提供一个简单易用的 sql mapper 框架，让开发者可以更专注于业务逻辑的开发。

如果你是一个 golang 开发者，或者你正在寻找一个简单易用的 sql mapper 框架，那么 juice 可能是你的不二之选。


项目主页
------------------------------

https://github.com/go-juicedev/juice

**文档链接**

- 简体中文: https://juice-doc.readthedocs.io/en/latest/
- English: https://juice-doc.readthedocs.io/projects/juice-doc-en/en/latest/


为什么选择 Juice
------------------------------

设计理念
~~~~~~~~~~~~~~

Juice 的设计遵循以下核心理念：

- **简单优于复杂**：API 设计简洁直观，学习曲线平缓
- **显式优于隐式**：SQL 语句清晰可见，行为可预测
- **性能至上**：零依赖、对象池、预分配等多重优化
- **类型安全**：充分利用 Go 泛型，编译期类型检查
- **可扩展性**：中间件机制支持灵活扩展

与其他框架对比
~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: 20 15 15 15 15 20

   * - 特性
     - Juice
     - GORM
     - sqlx
     - ent
     - 说明
   * - 零依赖
     - ✅
     - ❌
     - ❌
     - ❌
     - 仅依赖 Go 标准库
   * - 动态 SQL
     - ✅
     - 部分
     - ❌
     - ❌
     - 完整的 MyBatis 风格动态 SQL
   * - 泛型支持
     - ✅
     - ❌
     - ❌
     - ✅
     - Go 泛型
   * - SQL 可见性
     - ✅
     - ❌
     - ✅
     - ❌
     - SQL 语句集中管理
   * - 学习成本
     - 低
     - 中
     - 低
     - 高
     - 类 MyBatis 设计
   * - 性能
     - 🚀 优秀
     - 良好
     - 🚀 优秀
     - 良好
     - 接近原生 database/sql
   * - 代码生成
     - ✅
     - ✅
     - ❌
     - ✅
     - 可选的代码生成工具
   * - 中间件
     - ✅
     - ✅
     - ❌
     - ✅
     - 灵活的拦截器机制

适用场景
~~~~~~~~~~~~~~

Juice 特别适合以下场景：

✅ **复杂查询场景**
   - 需要编写复杂的 SQL 查询
   - 需要动态构建查询条件
   - 需要精确控制 SQL 执行

✅ **高性能要求**
   - 对性能有严格要求的应用
   - 高并发场景
   - 需要接近原生性能的场景

✅ **团队协作**
   - DBA 和开发人员分工明确
   - SQL 需要集中管理和审查
   - 需要 SQL 版本控制

✅ **微服务架构**
   - 轻量级，适合容器化部署
   - 零依赖，减少供应链风险
   - 启动快速，资源占用少

❌ **不太适合的场景**
   - 简单 CRUD 为主的应用（GORM 可能更合适）
   - 需要自动迁移的场景（ent 可能更合适）
   - 不熟悉 SQL 的团队



特性
------------------------------

- 🚀 **轻量级，高性能，无第三方依赖**
  
  仅依赖 Go 标准库，二进制体积小，启动快速

- 🔧 **动态 SQL 支持，灵活构建复杂查询**
  
  完整支持 if、where、set、foreach、choose 等动态标签

- 🗄️ **支持多数据源，主从数据库切换**
  
  轻松实现读写分离和多数据源管理

- 🎯 **泛型结果集映射，类型安全**
  
  充分利用 Go 泛型特性，编译期类型检查

- 🔗 **中间件机制，可扩展架构**
  
  内置调试、超时中间件，支持自定义扩展

- 📝 **自定义表达式和函数**
  
  支持在动态 SQL 中使用自定义函数和表达式

- 🛠️ **代码生成工具**
  
  可选的代码生成工具，提升开发效率

- 🔒 **事务管理**
  
  简洁的事务 API，支持事务复用语义与隔离级别控制

- 🔍 **SQL 调试和性能监控**
  
  内置 SQL 日志和执行时间统计

- 📊 **多种数据库支持**
  
  MySQL, PostgreSQL, SQLite, Oracle 等主流数据库

- 🔧 **连接池管理**
  
  灵活的连接池配置，优化资源使用


性能特性
~~~~~~~~~~~~~~

Juice 在设计时特别注重性能优化：

**零依赖设计**
   - 仅依赖 Go 标准库
   - 减少依赖链，降低风险
   - 二进制体积更小

**对象池优化**
   - 使用 sync.Pool 复用 strings.Builder
   - 减少内存分配和 GC 压力
   - 提升高并发场景性能

**预分配策略**
   - 切片容量预分配
   - 字符串构建器容量预估
   - 减少内存重新分配

**智能缓存**
   - 预编译语句缓存
   - 反射结果缓存
   - 表达式编译缓存

**批量优化**
   - 智能批次处理
   - 预编译语句复用
   - 减少数据库往返


安装
------------------------------

**版本要求**

- go 1.25+

.. code-block:: bash

   go get -u github.com/go-juicedev/juice

快速开始
------------------------------

1. 编写sql mapper配置文件


.. code-block:: html

   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <environments default="prod">
           <environment id="prod">
               <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
               <driver>mysql</driver>
           </environment>
       </environments>

       <mappers>
           <mapper namespace="main">
               <select id="HelloWorld">
                   select "hello world" as message
               </select>
           </mapper>
       </mappers>
   </configuration>

..  attention::
   注意：`dataSource` 的格式跟用 `sql.Open()` 函数的格式相同。


2. 编写代码


.. code-block:: go

   package main

   import (
      "context"
      "fmt"

      "github.com/go-juicedev/juice"
      _ "github.com/go-sql-driver/mysql"
   )

   func HelloWorld() {}

   func main() {
      cfg, err := juice.NewXMLConfiguration("config.xml")
      if err != nil {
         fmt.Println(err)
         return
      }

      engine, err := juice.Default(cfg)
      if err != nil {
         fmt.Println(err)
         return
      }
      defer engine.Close()

      message, err := juice.NewGenericManager[string](engine).Object(HelloWorld).QueryContext(context.Background(), nil)
      if err != nil {
         fmt.Println(err)
         return
      }
      fmt.Println(message)
   }




..  attention::

   注意：虽然 `juice` 不依赖第三方库，但是它需要依赖数据库驱动，所以在使用 juice 之前，你需要先安装数据库驱动，比如要使用mysql，
   那么你需要先安装 `github.com/go-sql-driver/mysql`

   如果运行报错，那么可能是因为你的数据库没有启动，或者你的数据库配置有误，检查一下数据库配置是否正确。

3. 运行代码


.. code-block:: bash

   go run .

4. 输出结果


.. code-block:: bash

   [juice] 2022/11/05 19:56:49 [main.HelloWorld]  select "hello world" as message  []  5.3138ms
   hello world


如果你看到了上面的输出结果，那么恭喜你，你已经成功运行了 juice。


更多示例
------------------------------

用户查询示例
~~~~~~~~~~~~~~

**配置文件 (user_mapper.xml)**

.. code-block:: text

   <?xml version="1.0" encoding="UTF-8"?>
   <mapper namespace="repository.UserRepository">
       <!-- 根据ID查询用户 -->
       <select id="GetUserByID">
           SELECT id, name, email, age, created_at
           FROM users
           WHERE id = #{id}
       </select>

       <!-- 动态条件查询 -->
       <select id="SearchUsers">
           SELECT id, name, email, age
           FROM users
           <where>
               <if test='name != ""'>
                   AND name LIKE concat('%', #{name}, '%')
               </if>
               <if test='minAge > 0'>
                   AND age >= #{minAge}
               </if>
               <if test='maxAge > 0'>
                   AND age <= #{maxAge}
               </if>
           </where>
           ORDER BY created_at DESC
       </select>

       <!-- 批量插入 -->
       <insert id="BatchInsertUsers" batchSize="100">
           INSERT INTO users (name, email, age)
           VALUES
           <foreach collection="users" item="user" separator=",">
               (#{user.name}, #{user.email}, #{user.age})
           </foreach>
       </insert>

       <!-- 动态更新 -->
       <update id="UpdateUser">
           UPDATE users
           <set>
               <if test='name != ""'>
                   name = #{name},
               </if>
               <if test='email != ""'>
                   email = #{email},
               </if>
               <if test='age > 0'>
                   age = #{age},
               </if>
           </set>
           WHERE id = #{id}
       </update>
   </mapper>

**Go 代码**

.. code-block:: go

   package repository

   import (
       "context"
       "github.com/go-juicedev/juice"
   )

   type User struct {
       ID        int64  `column:"id"`
       Name      string `column:"name"`
       Email     string `column:"email"`
       Age       int    `column:"age"`
       CreatedAt string `column:"created_at"`
   }

   type UserRepository interface {
       GetUserByID(ctx context.Context, id int64) (*User, error)
       SearchUsers(ctx context.Context, name string, minAge, maxAge int) ([]*User, error)
       BatchInsertUsers(ctx context.Context, users []*User) error
       UpdateUser(ctx context.Context, id int64, name, email string, age int) error
   }

   type userRepositoryImpl struct {
       engine juice.Manager
   }

   func NewUserRepository(engine juice.Manager) UserRepository {
       return &userRepositoryImpl{engine: engine}
   }

   func (r *userRepositoryImpl) GetUserByID(ctx context.Context, id int64) (*User, error) {
       params := juice.H{"id": id}
       return juice.NewGenericManager[*User](r.engine).
           Object(r.GetUserByID).
           QueryContext(ctx, params)
   }

   func (r *userRepositoryImpl) SearchUsers(ctx context.Context, name string, minAge, maxAge int) ([]*User, error) {
       params := juice.H{
           "name":   name,
           "minAge": minAge,
           "maxAge": maxAge,
       }
       return juice.NewGenericManager[[]*User](r.engine).
           Object(r.SearchUsers).
           QueryContext(ctx, params)
   }

   func (r *userRepositoryImpl) BatchInsertUsers(ctx context.Context, users []*User) error {
       params := juice.H{"users": users}
       _, err := r.engine.Object(r.BatchInsertUsers).ExecContext(ctx, params)
       return err
   }

   func (r *userRepositoryImpl) UpdateUser(ctx context.Context, id int64, name, email string, age int) error {
       params := juice.H{
           "id":    id,
           "name":  name,
           "email": email,
           "age":   age,
       }
       _, err := r.engine.Object(r.UpdateUser).ExecContext(ctx, params)
       return err
   }



常见问题
------------------------------

**Q: Juice 和 MyBatis 有什么区别？**

A: Juice 借鉴了 MyBatis 的设计理念，但针对 Go 语言特性进行了优化：

- 充分利用 Go 泛型，提供类型安全的 API
- 零依赖设计，更轻量
- 更符合 Go 语言习惯

**Q: 为什么选择 XML 而不是注解？**

A: Go 语言不支持注解，XML 配置有以下优势：

- SQL 集中管理，便于审查和版本控制
- DBA 可以独立优化 SQL
- 支持复杂的动态 SQL
- IDE 插件支持（语法高亮、自动完成）

**Q: Juice 的性能如何？**

A: Juice 的性能接近原生 database/sql：

- 零依赖，无额外开销
- 对象池优化，减少 GC 压力
- 预分配策略，减少内存分配

**Q: 如何调试 SQL 语句？**

A: Juice 提供了多种调试方式：

- 使用 DebugMiddleware 打印 SQL 和参数
- 在配置中启用 debug 模式
- 使用 IDEA 插件查看 SQL
- 查看生成的 SQL 日志

**Q: 支持哪些数据库？**

A: Juice 支持所有 database/sql 兼容的数据库：

- MySQL / MariaDB
- PostgreSQL
- SQLite
- Oracle
- SQL Server
- 其他支持 database/sql 的数据库


社区与支持
------------------------------

**获取帮助**

- GitHub Issues: https://github.com/go-juicedev/juice/issues
- 文档: https://juice-doc.readthedocs.io/
- 示例代码: https://github.com/go-juicedev/juice/tree/main/examples

**贡献代码**

欢迎提交 Pull Request 和 Issue！

**IDEA 插件**

安装 Juice 插件获得更好的开发体验：

- 语法高亮
- 自动完成
- SQL 导航
- 错误检查

插件地址: https://plugins.jetbrains.com/plugin/26401-juice


详细文档
------------------------------

.. toctree::
   :maxdepth: 2
   :caption: 核心功能

   configuration
   mappers
   security
   result_mapping
   tx
   tx_semantics
   multi_source_tx
   dynamic_sql
   expr
   raw_sql
   middleware

.. toctree::
   :maxdepth: 2
   :caption: 高级功能

   e2e_best_practice
   code_generate
   extension
   idea-plugin

.. toctree::
   :maxdepth: 2
   :caption: 其他

   eatmoreapple
