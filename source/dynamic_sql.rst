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
- bind 标签只能在包含它的语句中使用，不能跨语句使用
- bind 标签只能在 select、insert、update、delete 的第一层子标签中定义

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

.. tip::
    动态SQL的最佳实践：

    1. 合理使用SQL片段复用，提高维护性
    2. 注意条件判断的性能影响
    3. 使用参数化查询防止SQL注入
    4. 保持SQL语句的可读性
    5. 适当添加注释说明复杂的动态SQL逻辑