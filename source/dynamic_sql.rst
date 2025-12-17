动态SQL
============

.. note::

    动态SQL是一种强大的数据库查询技术，它允许在运行时根据不同条件动态生成SQL语句。这种技术特别适用于复杂的查询场景，如条件搜索、批量操作和灵活的数据操作。动态SQL不仅提高了代码的复用性和可维护性，还能优化查询性能，减少冗余代码。

Juice提供了丰富的动态SQL支持，通过XML配置方式实现灵活的SQL构建。以下是支持的主要动态SQL元素：

条件判断（if）
--------------

``if`` 元素用于条件判断，根据表达式结果决定是否包含特定的SQL片段：

.. code-block:: xml

    <select id="SelectByCondition">
        select * from user
        <if test='name != ""'>
            where name = #{name}
        </if>
    </select>

.. tip::
    条件表达式支持各种运算符和函数，如：``&&``、``||``、``!``、``>``, ``<``、``==``、``!=`` 等。

动态WHERE（where）
----------------

``where`` 元素智能处理WHERE子句，自动添加WHERE关键字并去除多余的AND/OR：

.. code-block:: xml

    <select id="SelectByCondition">
        select * from user
        <where>
            <if test='name != ""'>
                and name = #{name}
            </if>
            <if test='age > 0'>
                and age > #{age}
            </if>
        </where>
    </select>

.. note::
    ``where`` 元素会自动处理以下情况：

    - 如果where中的条件都不满足，则不会添加where关键字
    - 自动去除开头的AND/OR
    - 确保生成的SQL语法正确

动态SET（set）
-------------

``set`` 元素用于UPDATE语句，自动处理SET子句并去除多余的逗号：

.. code-block:: xml

    <update id="UpdateUser">
        update user
        <set>
            <if test='name != ""'>
                name = #{name},
            </if>
            <if test='age > 0'>
                age = #{age},
            </if>
            <if test='email != null'>
                email = #{email},
            </if>
        </set>
        where id = #{id}
    </update>

.. tip::
    ``set`` 元素会自动：
    - 添加SET关键字
    - 去除最后多余的逗号
    - 如果没有要更新的字段，会生成有效的SQL

集合遍历（foreach）
-----------------

``foreach`` 元素用于遍历集合，常用于IN条件和批量操作：

.. code-block:: xml

    <select id="SelectByIds">
        select * from user where id in
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </select>

    <!-- 批量插入示例 -->
    <insert id="BatchInsert">
        insert into user (name, age) values
        <foreach collection="users" item="user" separator=",">
            (#{user.name}, #{user.age})
        </foreach>
    </insert>

.. note::
    foreach支持的属性：

    - ``collection``: 要遍历的集合
    - ``item``: 当前遍历的元素
    - ``index``: 当前遍历的索引
    - ``open``: 开始字符
    - ``close``: 结束字符
    - ``separator``: 分隔符

条件修饰（trim）
--------------

``trim`` 元素用于自定义SQL语句的修饰规则：

.. code-block:: xml

    <select id="SelectWithTrim">
        select * from user
        <trim prefix="where" prefixOverrides="and |or ">
            <if test='name != null'>
                and name like #{name}
            </if>
            <if test='age > 0'>
                or age > #{age}
            </if>
        </trim>
    </select>

.. tip::
    trim的属性说明：

    - ``prefix``: 要添加的前缀
    - ``prefixOverrides``: 要去除的前缀
    - ``suffix``: 要添加的后缀
    - ``suffixOverrides``: 要去除的后缀

多重条件选择（choose）
-------------------

``choose`` 元素提供类似switch的条件选择功能：

.. code-block:: xml

    <select id="SelectByChoice">
        select * from user
        <where>
            <choose>
                <when test='searchType == "name"'>
                    and name like concat('%', #{keyword}, '%')
                </when>
                <when test='searchType == "email"'>
                    and email = #{keyword}
                </when>
                <otherwise>
                    and id = #{keyword}
                </otherwise>
            </choose>
        </where>
    </select>

SQL片段复用（sql/include）
------------------------

``sql`` 和 ``include`` 元素用于SQL片段的定义和复用：

.. code-block:: xml

    <mapper namespace="user">
        <sql id="userColumns">
            id, name, age, email, create_time
        </sql>

        <select id="GetUsers">
            select
            <include refid="userColumns"/>
            from user
            where status = 1
        </select>
    </mapper>


跨namespace 引用
~~~~~~~~~~~~~~~~

在多个namespace之间，可以使用 ``sql/include`` 元素来引用另一个namespace中的SQL片段。

.. code-block:: xml

    <mapper namespace="user">
        <sql id="userColumns">
            id, name, age, email, create_time
        </sql>
    </mapper>

    <mapper namespace="admin">
        <select id="GetUsers">
            select
            <include refid="user.userColumns"/>
            from user
            where status = 1
        </select>
    </mapper>

.. tip::
    sql 的 id 属性是必须的，但是必须是合法的变量名。


sql 片段参数化
~~~~~~~~~~~~~~~~
``sql`` 元素支持参数化，可以通过 ``<bind>`` 元素传递参数：

.. code-block:: xml

    <mapper namespace="user">
        <sql id="selectByField">
            select * from user where ${field} = #{value}
        </sql>

        <select id="GetUsersByDynamicField">
            <bind name="field" value='name'/> <!-- 动态字段名 -->
            <bind name="value" value='"eatmoreapple"'/> <!-- 静态值 -->
            <include refid="selectByField"/>
        </select>
    </mapper>

在上面的例子中，我们通过 <bind> 元素定义了两个参数 field 和 value，并在 sql 片段中使用它们来动态生成 SQL 语句。

参数作用域和优先级

作用域限制
- bind 标签不仅可以在语句的顶层定义，还可以嵌套在动态 SQL 标签（如 <if>、<where>、<foreach> 等）内部使用
- 嵌套的 bind 标签具有局部作用域，只在当前标签及其子标签内有效
- 父标签定义的 bind 变量对子标签可见，子标签可直接使用
- 内部作用域定义的变量会覆盖外部作用域的同名变量

参数查找优先级
参数查找时遵循以下优先级顺序：
    1. bind 定义的参数 - 优先级最高
    2. 传递的参数 - 用户传入的参数
    3. 系统内置参数 - 如 _databaseId、_parameter 等

这意味着 bind 定义的参数可以覆盖用户传递的同名参数。

高级用法示例

1. 字符串处理

.. code-block:: xml

    <select id="searchUsers">
       <bind name="searchPattern" value='"%" + name + "%"'/>
       <bind name="upperName" value='name.toUpperCase()'/>
       SELECT * FROM users WHERE name LIKE #{searchPattern} OR UPPER(name) = #{upperName}
    </select>

2. 数值计算

.. code-block:: xml

    <select id="getPageUsers">
       <bind name="offset" value='pageNum * pageSize'/>
       <bind name="limit" value='pageSize'/>
       SELECT * FROM users ORDER BY id LIMIT #{limit} OFFSET #{offset}
    </select>

3. 复杂对象处理

.. code-block:: xml

    <select id="complexSearch">
        <bind name="userAge" value='user.age'/>
        <bind name="userName" value='user.name'/>
        <bind name="isActive" value='user.active'/>
        SELECT * FROM users WHERE age >= #{userAge} AND name = #{userName} AND active = #{isActive}
    </select>

4. 作用域与覆盖示例

.. code-block:: xml

    <select id="scopedBindExample">
        <bind name="pattern" value='"%"'/>
        SELECT * FROM users
        <where>
            <if test='name != ""'>
                <!-- 覆盖外部的 pattern 变量 -->
                <bind name="pattern" value='"%" + name + "%"'/>
                AND name LIKE #{pattern}
            </if>
        </where>
        <!-- 这里的 pattern 仍然是 "%" -->
        OR description LIKE #{pattern}
    </select>

.. tip::
    动态SQL的最佳实践：

    1. 合理使用SQL片段复用，提高维护性
    2. 注意条件判断的性能影响
    3. 使用参数化查询防止SQL注入
    4. 保持SQL语句的可读性
    5. 适当添加注释说明复杂的动态SQL逻辑

复杂查询实战
============

多条件动态搜索
--------------

电商商品搜索示例
~~~~~~~~~~~~~~~~

.. code-block:: xml

    <select id="SearchProducts">
        SELECT 
            p.id, p.name, p.price, p.stock,
            c.name as category_name,
            b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        <where>
            <!-- 商品状态过滤 -->
            <if test='status != nil'>
                AND p.status = #{status}
            </if>
            
            <!-- 关键词搜索：商品名称或描述 -->
            <if test='keyword != ""'>
                AND (
                    p.name LIKE concat('%', #{keyword}, '%')
                    OR p.description LIKE concat('%', #{keyword}, '%')
                )
            </if>
            
            <!-- 价格区间过滤 -->
            <if test='minPrice > 0'>
                AND p.price >= #{minPrice}
            </if>
            <if test='maxPrice > 0'>
                AND p.price &lt;= #{maxPrice}
            </if>
            
            <!-- 分类过滤：支持多个分类 -->
            <if test='categoryIds != nil and length(categoryIds) > 0'>
                AND p.category_id IN
                <foreach collection="categoryIds" item="id" open="(" close=")" separator=",">
                    #{id}
                </foreach>
            </if>
            
            <!-- 品牌过滤 -->
            <if test='brandIds != nil and length(brandIds) > 0'>
                AND p.brand_id IN
                <foreach collection="brandIds" item="id" open="(" close=")" separator=",">
                    #{id}
                </foreach>
            </if>
            
            <!-- 库存过滤 -->
            <if test='inStock == true'>
                AND p.stock > 0
            </if>
            
            <!-- 标签过滤 -->
            <if test='tags != nil and length(tags) > 0'>
                AND EXISTS (
                    SELECT 1 FROM product_tags pt
                    WHERE pt.product_id = p.id
                    AND pt.tag_id IN
                    <foreach collection="tags" item="tag" open="(" close=")" separator=",">
                        #{tag}
                    </foreach>
                )
            </if>
        </where>
        
        <!-- 动态排序 -->
        ORDER BY
        <choose>
            <when test='sortBy == "price_asc"'>
                p.price ASC
            </when>
            <when test='sortBy == "price_desc"'>
                p.price DESC
            </when>
            <when test='sortBy == "sales"'>
                p.sales_count DESC
            </when>
            <when test='sortBy == "newest"'>
                p.created_at DESC
            </when>
            <otherwise>
                p.id DESC
            </otherwise>
        </choose>
        
        <!-- 分页 -->
        <if test='limit > 0'>
            LIMIT #{limit} OFFSET #{offset}
        </if>
    </select>

用户权限查询示例
~~~~~~~~~~~~~~~~

.. code-block:: xml

    <select id="GetUserPermissions">
        SELECT DISTINCT
            p.id, p.code, p.name, p.resource_type
        FROM permissions p
        <where>
            <!-- 通过用户角色获取权限 -->
            <if test='userId > 0'>
                AND EXISTS (
                    SELECT 1 FROM user_roles ur
                    INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                    WHERE ur.user_id = #{userId}
                    AND rp.permission_id = p.id
                    AND ur.status = 1
                    AND rp.status = 1
                )
            </if>
            
            <!-- 权限类型过滤 -->
            <if test='resourceTypes != nil and length(resourceTypes) > 0'>
                AND p.resource_type IN
                <foreach collection="resourceTypes" item="type" open="(" close=")" separator=",">
                    #{type}
                </foreach>
            </if>
            
            <!-- 只查询启用的权限 -->
            AND p.status = 1
        </where>
        ORDER BY p.sort_order ASC
    </select>

复杂统计查询
------------

销售数据统计
~~~~~~~~~~~~

.. code-block:: xml

    <select id="GetSalesStatistics">
        SELECT
            <choose>
                <!-- 按日统计 -->
                <when test='groupBy == "day"'>
                    DATE(o.created_at) as date_key,
                </when>
                <!-- 按月统计 -->
                <when test='groupBy == "month"'>
                    DATE_FORMAT(o.created_at, '%Y-%m') as date_key,
                </when>
                <!-- 按年统计 -->
                <when test='groupBy == "year"'>
                    YEAR(o.created_at) as date_key,
                </when>
            </choose>
            COUNT(DISTINCT o.id) as order_count,
            COUNT(DISTINCT o.user_id) as customer_count,
            SUM(o.total_amount) as total_sales,
            AVG(o.total_amount) as avg_order_value,
            SUM(o.item_count) as total_items
        FROM orders o
        <where>
            <!-- 时间范围过滤 -->
            <if test='startDate != ""'>
                AND o.created_at >= #{startDate}
            </if>
            <if test='endDate != ""'>
                AND o.created_at &lt; #{endDate}
            </if>
            
            <!-- 订单状态过滤 -->
            <if test='statuses != nil and length(statuses) > 0'>
                AND o.status IN
                <foreach collection="statuses" item="status" open="(" close=")" separator=",">
                    #{status}
                </foreach>
            </if>
            
            <!-- 商品分类过滤 -->
            <if test='categoryId > 0'>
                AND EXISTS (
                    SELECT 1 FROM order_items oi
                    INNER JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = o.id
                    AND p.category_id = #{categoryId}
                )
            </if>
        </where>
        GROUP BY date_key
        ORDER BY date_key DESC
    </select>

动态批量操作
------------

批量更新示例
~~~~~~~~~~~~

.. code-block:: xml

    <update id="BatchUpdateProductPrices">
        <foreach collection="products" item="product" separator=";">
            UPDATE products
            SET 
                price = #{product.price},
                updated_at = NOW()
            WHERE id = #{product.id}
        </foreach>
    </update>

条件批量删除
~~~~~~~~~~~~

.. code-block:: xml

    <delete id="BatchDeleteInactiveUsers">
        DELETE FROM users
        <where>
            <!-- 删除指定状态的用户 -->
            <if test='status != nil'>
                AND status = #{status}
            </if>
            
            <!-- 删除指定时间之前创建的用户 -->
            <if test='createdBefore != ""'>
                AND created_at &lt; #{createdBefore}
            </if>
            
            <!-- 删除最后登录时间早于指定时间的用户 -->
            <if test='lastLoginBefore != ""'>
                AND last_login_at &lt; #{lastLoginBefore}
            </if>
            
            <!-- 排除特定用户ID -->
            <if test='excludeIds != nil and length(excludeIds) > 0'>
                AND id NOT IN
                <foreach collection="excludeIds" item="id" open="(" close=")" separator=",">
                    #{id}
                </foreach>
            </if>
        </where>
        <!-- 安全限制：最多删除1000条 -->
        LIMIT 1000
    </delete>

性能优化技巧
============

避免常见性能陷阱
----------------

**1. 避免不必要的条件判断**

❌ **不推荐**：

.. code-block:: xml

    <select id="GetUsers">
        SELECT * FROM users
        <if test='true'>
            WHERE status = 1
        </if>
    </select>

✅ **推荐**：

.. code-block:: xml

    <select id="GetUsers">
        SELECT * FROM users
        WHERE status = 1
    </select>

**2. 合理使用 foreach**

❌ **不推荐**：IN 条件包含过多值

.. code-block:: xml

    <!-- 当 ids 包含 10000 个值时性能很差 -->
    <select id="GetUsersByIds">
        SELECT * FROM users
        WHERE id IN
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </select>

✅ **推荐**：使用临时表或分批查询

.. code-block:: go

    // 分批查询
    func GetUsersByIds(ctx context.Context, ids []int64) ([]*User, error) {
        const batchSize = 1000
        var allUsers []*User
        
        for i := 0; i < len(ids); i += batchSize {
            end := i + batchSize
            if end > len(ids) {
                end = len(ids)
            }
            
            batch := ids[i:end]
            users, err := queryBatch(ctx, batch)
            if err != nil {
                return nil, err
            }
            allUsers = append(allUsers, users...)
        }
        
        return allUsers, nil
    }

**3. 避免 N+1 查询问题**

❌ **不推荐**：

.. code-block:: go

    // 先查询所有订单
    orders, _ := GetOrders(ctx)
    
    // 然后为每个订单查询详情（N+1 问题）
    for _, order := range orders {
        items, _ := GetOrderItems(ctx, order.ID)
        order.Items = items
    }

✅ **推荐**：使用 JOIN 或 IN 查询

.. code-block:: xml

    <select id="GetOrdersWithItems">
        SELECT 
            o.id as order_id,
            o.total_amount,
            oi.id as item_id,
            oi.product_id,
            oi.quantity,
            oi.price
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = 1
    </select>

索引优化建议
------------

**1. 确保 WHERE 条件使用索引**

.. code-block:: xml

    <select id="SearchUsers">
        SELECT * FROM users
        <where>
            <!-- 确保 email 字段有索引 -->
            <if test='email != ""'>
                AND email = #{email}
            </if>
            
            <!-- 确保 (status, created_at) 有复合索引 -->
            <if test='status > 0'>
                AND status = #{status}
            </if>
            <if test='createdAfter != ""'>
                AND created_at > #{createdAfter}
            </if>
        </where>
    </select>

**2. 避免在索引列上使用函数**

❌ **不推荐**：

.. code-block:: xml

    <select id="GetUsersByDate">
        SELECT * FROM users
        WHERE DATE(created_at) = #{date}  <!-- 索引失效 -->
    </select>

✅ **推荐**：

.. code-block:: xml

    <select id="GetUsersByDate">
        SELECT * FROM users
        WHERE created_at >= #{date}
        AND created_at &lt; DATE_ADD(#{date}, INTERVAL 1 DAY)
    </select>

查询优化
--------

**1. 只查询需要的字段**

❌ **不推荐**：

.. code-block:: xml

    <select id="GetUserNames">
        SELECT * FROM users  <!-- 查询所有字段 -->
    </select>

✅ **推荐**：

.. code-block:: xml

    <select id="GetUserNames">
        SELECT id, name FROM users  <!-- 只查询需要的字段 -->
    </select>

**2. 使用 LIMIT 限制结果集**

.. code-block:: xml

    <select id="GetRecentOrders">
        SELECT * FROM orders
        ORDER BY created_at DESC
        LIMIT 100  <!-- 限制返回数量 -->
    </select>

**3. 合理使用子查询**

❌ **不推荐**：相关子查询

.. code-block:: xml

    <select id="GetUsersWithOrderCount">
        SELECT 
            u.*,
            (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
        FROM users u
    </select>

✅ **推荐**：JOIN 或独立子查询

.. code-block:: xml

    <select id="GetUsersWithOrderCount">
        SELECT 
            u.*,
            COALESCE(o.order_count, 0) as order_count
        FROM users u
        LEFT JOIN (
            SELECT user_id, COUNT(*) as order_count
            FROM orders
            GROUP BY user_id
        ) o ON u.id = o.user_id
    </select>

批量操作优化
------------

**1. 使用 batchSize 控制批次大小**

.. code-block:: xml

    <insert id="BatchInsertProducts" batchSize="500">
        INSERT INTO products (name, price, stock)
        VALUES
        <foreach collection="products" item="p" separator=",">
            (#{p.name}, #{p.price}, #{p.stock})
        </foreach>
    </insert>

**2. 批量更新优化**

使用 CASE WHEN 进行批量更新：

.. code-block:: xml

    <update id="BatchUpdatePrices">
        UPDATE products
        SET price = CASE id
            <foreach collection="products" item="p">
                WHEN #{p.id} THEN #{p.price}
            </foreach>
        END
        WHERE id IN
        <foreach collection="products" item="p" open="(" close=")" separator=",">
            #{p.id}
        </foreach>
    </update>

调试和监控
==========

SQL 调试技巧
------------

**1. 启用调试模式**

全局启用：

.. code-block:: xml

    <settings>
        <setting name="debug" value="true"/>
    </settings>

单个语句启用：

.. code-block:: xml

    <select id="GetUsers" debug="true">
        SELECT * FROM users
    </select>

**2. 使用自定义日志中间件**

.. code-block:: go

    type SQLLogger struct {
        logger *log.Logger
    }

    func (m *SQLLogger) QueryContext(stmt juice.Statement, cfg juice.Configuration, next juice.QueryHandler) juice.QueryHandler {
        return func(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
            start := time.Now()
            
            // 记录SQL和参数
            m.logger.Printf("[SQL] %s", query)
            m.logger.Printf("[ARGS] %v", args)
            
            rows, err := next(ctx, query, args...)
            duration := time.Since(start)
            
            if err != nil {
                m.logger.Printf("[ERROR] %v (took %v)", err, duration)
            } else {
                m.logger.Printf("[SUCCESS] took %v", duration)
            }
            
            return rows, err
        }
    }

性能分析
--------

**1. 慢查询监控**

.. code-block:: go

    type SlowQueryMonitor struct {
        threshold time.Duration
        reporter  func(query string, duration time.Duration, args []any)
    }

    func (m *SlowQueryMonitor) QueryContext(stmt juice.Statement, cfg juice.Configuration, next juice.QueryHandler) juice.QueryHandler {
        return func(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
            start := time.Now()
            rows, err := next(ctx, query, args...)
            duration := time.Since(start)
            
            if duration > m.threshold {
                m.reporter(query, duration, args)
            }
            
            return rows, err
        }
    }

**2. 查询统计**

.. code-block:: go

    type QueryStats struct {
        mu          sync.RWMutex
        queryCount  map[string]int64
        totalTime   map[string]time.Duration
        avgTime     map[string]time.Duration
    }

    func (s *QueryStats) Record(stmtID string, duration time.Duration) {
        s.mu.Lock()
        defer s.mu.Unlock()
        
        s.queryCount[stmtID]++
        s.totalTime[stmtID] += duration
        s.avgTime[stmtID] = s.totalTime[stmtID] / time.Duration(s.queryCount[stmtID])
    }

    func (s *QueryStats) Report() {
        s.mu.RLock()
        defer s.mu.RUnlock()
        
        for stmtID, count := range s.queryCount {
            fmt.Printf("Statement: %s\n", stmtID)
            fmt.Printf("  Count: %d\n", count)
            fmt.Printf("  Total Time: %v\n", s.totalTime[stmtID])
            fmt.Printf("  Avg Time: %v\n", s.avgTime[stmtID])
        }
    }

最佳实践总结
============

动态 SQL 设计原则
------------------

1. **保持简单**
   
   - 避免过度复杂的嵌套条件
   - 复杂逻辑考虑拆分为多个语句
   - 优先使用简单的条件判断

2. **性能优先**
   
   - 确保动态生成的 SQL 能使用索引
   - 避免全表扫描
   - 合理使用 LIMIT

3. **可维护性**
   
   - 添加清晰的注释
   - 使用有意义的变量名
   - 保持一致的代码风格

4. **安全性**
   
   - 始终使用参数绑定（#{param}）
   - 避免使用字符串替换（${param}）除非必要
   - 验证用户输入

检查清单
--------

在编写动态 SQL 前，请确认：

.. code-block:: text

    ☐ 是否真的需要动态 SQL？
    ☐ 条件判断是否合理？
    ☐ 是否会导致 N+1 查询？
    ☐ 是否使用了索引？
    ☐ 是否限制了结果集大小？
    ☐ 是否使用了参数绑定？
    ☐ 是否添加了注释？
    ☐ 是否进行了性能测试？

.. tip::
    **推荐工具**：
    
    - 使用 EXPLAIN 分析查询计划
    - 使用 Juice IDEA 插件检查 SQL 语法
    - 使用慢查询日志监控性能
    - 定期 review 和优化 SQL

.. warning::
    **常见错误**：
    
    - 在循环中执行查询（N+1 问题）
    - IN 条件包含过多值
    - 在索引列上使用函数
    - 忽略 NULL 值处理
    - 不使用 LIMIT 限制结果
