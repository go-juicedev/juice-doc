结果集映射
==============================
结果集映射是 Juice 框架中一个核心功能，它负责将数据库查询结果转换为 Go 语言中的结构化数据。Juice 提供了多种灵活的映射方式，从简单的单行映射到复杂的嵌套对象映射都能优雅处理。

原生SQL.Rows支持
----------------

Juice 完全兼容 ``database/sql`` 包的 ``Rows`` 接口：

.. code-block:: go

    type Rows interface {
        Columns() ([]string, error)
        Close() error
        Next() bool
        Scan(dest ...interface{}) error
    }

基本用法示例：

.. code-block:: go

    rows, err := engine.Object("main.SelectUser").QueryContext(context.TODO(), nil)
    if err != nil {
        panic(err)
    }
    defer rows.Close()  // 确保资源释放

    for rows.Next() {
        var user User
        if err := rows.Scan(&user.Id, &user.Name, &user.Age); err != nil {
            panic(err)
        }
        fmt.Println(user)
    }

    if err = rows.Err(); err != nil {
        panic(err)
    }

Object方法说明
"""""""""""""

``Object`` 方法支持多种参数类型：

1. **字符串类型**：

   .. code-block:: go

       engine.Object("main.SelectUser")

2. **函数类型**：
   使用函数在代码中的位置作为ID

.. note::
    Object方法的ID生成规则：
    - 包名.函数名（普通函数）
    - 包名.类型名.方法名（结构体方法）
    - 注意区分interface和struct

泛型结果集映射
-------------

Juice提供了强大的泛型支持，使结果集映射更加类型安全：

.. code-block:: go

    type GenericManager[T any] interface {
        Object(v any) GenericExecutor[T]
    }

映射场景示例
"""""""""""

1. **单字段单行**：

   .. code-block:: go

       // 查询单个计数
       count, err := juice.NewGenericManager[int](engine).
           Object("CountUsers").QueryContext(context.TODO(), nil)

2. **多字段单行**：

   .. code-block:: go

       type User struct {
           ID   int64  `column:"id"`
           Name string `column:"name"`
       }

       // 查询单个用户
       user, err := juice.NewGenericManager[User](engine).
           Object("GetUser").QueryContext(context.TODO(), nil)

3. **单字段多行**：

   .. code-block:: go

       // 查询多个ID
       ids, err := juice.NewGenericManager[[]int64](engine).
           Object("GetUserIDs").QueryContext(context.TODO(), nil)

4. **多字段多行**：

   .. code-block:: go

       // 查询用户列表
       users, err := juice.NewGenericManager[[]User](engine).
           Object("GetUsers").QueryContext(context.TODO(), nil)

.. attention::
    - 结构体必须使用 ``column`` 标签指定数据库字段映射
    - 多行结果必须使用切片类型接收
    - 不支持使用map接收结果（设计选择）

自定义结果集映射
--------------

Juice 提供了三个核心的结果集映射函数：``Bind``、``List`` 和 ``List2``，它们各自适用于不同的场景。

Bind 函数
"""""""""""

``Bind`` 是最灵活的映射函数，可以处理任意类型的结果集映射：

.. code-block:: go

    func Bind[T any](rows *sql.Rows) (result T, err error)

特点：
- 支持任意类型的映射（结构体、切片、基本类型等）
- 灵活性最高
- 可以处理单行或多行数据

使用示例：

.. code-block:: go

    type User struct {
        ID   int    `column:"id"`
        Name string `column:"name"`
    }

    rows, _ := db.Query("SELECT id, name FROM users")
    defer rows.Close()

    // 映射到切片
    users, err := Bind[[]User](rows)

    // 映射到单个结构体
    user, err := Bind[User](rows)

List 函数
"""""""""""

``List`` 专门用于将结果集映射为切片类型：

.. code-block:: go

    func List[T any](rows *sql.Rows) (result []T, err error)

特点：
- 始终返回切片类型 ``[]T``
- 性能优于 ``Bind`` （针对切片场景）
- 空结果返回空切片而不是 nil
- 对非指针类型做了特殊优化

使用示例：

.. code-block:: go

    rows, _ := db.Query("SELECT id, name FROM users")
    defer rows.Close()

    users, err := List[User](rows)

List2 函数
"""""""""""

``List2`` 是 ``List`` 的变体，专门返回指针切片：

.. code-block:: go

    func List2[T any](rows *sql.Rows) ([]*T, error)

List2 主要是为了做一些指针类型的泛型结果集的返回。

特点：
- 返回指针切片 ``[]*T``
- 适合需要修改切片元素的场景
- 适合处理大型结构体
- 避免了值拷贝开销

使用示例：

.. code-block:: go

    rows, _ := db.Query("SELECT id, name FROM users")
    defer rows.Close()

    users, err := List2[User](rows)
    // users 类型为 []*User

选择指南
"""""""""""

1. 使用 ``Bind`` 当：
   - 需要最大的灵活性
   - 不确定返回类型
   - 需要处理单行数据

2. 使用 ``List`` 当：
   - 确定返回切片类型
   - 追求更好的性能
   - 处理值类型切片

3. 使用 ``List2`` 当：
   - 需要修改切片元素
   - 处理大型结构体
   - 想避免值拷贝

.. note::
    性能提示：

    - ``List`` 对非指针类型做了特殊优化
    - ``List2`` 虽然多一次转换，但可能在某些场景下性能更好
    - ``Bind`` 最灵活但可能不是最快的选择


自增主键映射
-----------

支持自动获取自增主键值：

.. code-block:: xml

    <insert id="CreateUser" useGeneratedKeys="true" keyProperty="ID">
        INSERT INTO users(name, age) VALUES(#{name}, #{age})
    </insert>

使用条件：

1. 数据库驱动支持 ``LastInsertId``
2. 参数必须是结构体指针
3. ``useGeneratedKeys="true"``
4. 指定 ``keyProperty`` 或使用 ``autoincr:"true"`` 标签
5. 主键字段类型必须支持整数赋值

批量插入优化
-----------

高效的批量数据插入支持：

.. code-block:: xml

    <insert id="BatchInsertUsers" batchSize="100">
        INSERT INTO users(name, age) VALUES(#{name}, #{age})
    </insert>

优化特性：

1. **智能批次处理**：
   - 自动分批处理大量数据
   - 可配置批次大小（batchSize）
   - 默认单次执行

2. **预编译优化**：
   - 预编译语句复用
   - 最多生成两个预编译语句
   - 有效减少数据库压力

3. **性能建议**：
   - 建议批次大小：50-1000
   - 根据数据量和数据库性能调整
   - 避免过大批次造成数据库压力

.. tip::
    批量插入最佳实践：

    1. 合理设置批次大小
    2. 注意监控数据库性能
    3. 考虑事务管理
    4. 做好错误处理