SQL Mappers
================

当我们将数据源信息配置好之后，就可以使用 SQL Mapper 来访问数据库了。首先，我们需要告诉 Juice 去哪里找到我们的 SQL 语句。

mappers 标签
----------------

``mappers`` 是 ``mapper`` 标签的父标签，它是一个集合标签，用来存放 ``mapper`` 标签。

.. code-block:: xml

   <?xml version="1.0" encoding="UTF-8"?>
    <configuration>
        <environments default="prod">
            <environment id="prod">
                <dataSource>root:qwe123@tcp(localhost:3306)/database</dataSource>
                <driver>mysql</driver>
            </environment>
        </environments>

        <mappers>
            <!-- 在这里定义 mapper 标签 -->
        </mappers>
    </configuration>


mapper 标签
----------------

``mapper`` 标签是用来存储 SQL 语句的集合标签。

基本用法示例：

.. code-block:: xml

   <mappers>
        <!-- 内联 mapper，直接在配置文件中定义 SQL -->
        <mapper namespace="main">
            <select id="HelloWorld">
                select "hello world" as message
            </select>
        </mapper>

        <!-- 引用外部 mapper 文件 -->
        <mapper resource="path_to_another_mapper.xml"/>
        
        <!-- 通过 URL 引用 mapper 文件 -->
        <mapper url="http(s)://domain:port/path"/>
        <mapper url="file://path to your mapper"/>
    </mappers>

**属性说明：**

- ``namespace``: 用来指定 mapper 的命名空间，这个命名空间用来区分不同的 mapper，它的值必须是唯一的。
- ``resource``: 用来引用另外一个 mapper 文件。注意：引用的 mapper 文件如果没有再次引用别的文件，那么它的 ``namespace`` 属性是必须的。
- ``url``: 通过 URL 来引用 mapper 文件。目前支持 ``http`` 和 ``file`` 协议。如果引用的 mapper 文件没有再次引用别的文件，那么它的 ``namespace`` 属性是必须的。

通过引用 mapper 文件，我们可以将 SQL 语句分散到不同的文件中，这样可以使得我们的结构更加清晰。

.. attention::
   ``namespace``、``resource``、``url`` 三个属性是互斥的，一个 ``mapper`` 标签只能使用其中的一个。


SQL 语句标签
-----------------------------------

Juice 支持四种类型的 SQL 语句标签：``select``、``insert``、``update``、``delete``。

.. code-block:: xml

   <mapper namespace="main">
        <!-- 查询语句 -->
        <select id="HelloWorld">
            select * from user
        </select>

        <!-- 插入语句 -->
        <insert id="insertUser">
            insert into user (name, age) values (#{name}, #{age})
        </insert>

        <!-- 更新语句 -->
        <update id="updateUser">
            update user set age = #{age} where name = #{name}
        </update>

        <!-- 删除语句 -->
        <delete id="deleteUser">
            delete from user where name = #{name}
        </delete>
    </mapper>

上述的 ``select``、``insert``、``update``、``delete`` 标签都有一个 ``id`` 属性，这个属性是用来标识 SQL 语句的，它的值在同一个 mapper 中必须是唯一的。

**常见问题：**

*问：可不可以在 select 标签里面写 delete 语句呢？*

*答：技术上可以，但强烈不推荐，每个标签都应该有自己的语义。*

参数处理
----------------

在 SQL 语句中使用参数
~~~~~~~~~~~~~~~~~~~~

我们可以在 SQL 语句中使用参数，这些参数可以通过外部传递进来，我们只需要通过特定的语法来引用这些参数即可。

**参数定义示例：**

.. code-block:: xml

   <mapper namespace="main">
        <select id="CountUserByName">
            select count(*) from user where name = #{name}
        </select>
    </mapper>

上述的 SQL 语句中，我们使用了 ``#{name}`` 来引用参数，这个参数的值将会在执行 SQL 语句的时候传递进来。

**参数语法对比：**

- ``#{name}``: 预编译参数，会被替换成占位符（``?``），可以防止 SQL 注入，**推荐使用**
- ``${name}``: 直接字符串替换，不会被替换成占位符，**有 SQL 注入风险，谨慎使用**

.. code-block:: xml

   <mapper namespace="main">
        <!-- 推荐：使用预编译参数 -->
        <select id="GetUserByName">
            select * from user where name = #{name}
        </select>

        <!-- 谨慎使用：直接字符串替换 -->
        <select id="GetUserByDynamicColumn">
            select * from user order by ${columnName}
        </select>
    </mapper>

.. warning::
    使用 ``${}`` 语法时，必须确保参数值是安全的，因为它不会进行 SQL 注入防护。

参数传递方式
~~~~~~~~~~~~~~~~~~~~

**1. Map 参数传递**

.. code-block:: go

    userMap := map[string]interface{}{
        "name": "eatmoreapple",
        "age":  25,
    }

    engine.Object("main.CountUserByName").QueryContext(context.TODO(), userMap)

**2. Struct 参数传递**

.. code-block:: go

    type User struct {
        Name string `param:"name"`  // 使用 param tag 自定义参数名
        Age  int    `param:"age"`
    }

    user := User{
        Name: "eatmoreapple",
        Age:  25,
    }

    engine.Object("main.CountUserByName").QueryContext(context.TODO(), user)

**3. 数组/切片参数传递**

既然 map 和 struct 都可以转换成 key-value 结构，那么如果我们传递一个 slice 或者 array 的参数，可以通过索引访问的形式来访问传递的参数：

.. code-block:: xml

     <mapper namespace="main">
        <select id="CountUserByName">
            select count(*) from user where name = #{0} and age = #{1}
        </select>
    </mapper>

.. code-block:: go

     engine.Object("main.CountUserByName").QueryContext(context.TODO(), []interface{}{"eatmoreapple", 25})

**4. 单一参数传递**

如果我们传递一个非 struct、非 map、非 slice/array 的参数，那么 Juice 会将这个参数包装成一个 map，这个 map 的 key 是 ``param``，value 是我们传递的参数。

.. code-block:: xml

    <mapper namespace="main">
        <select id="CountUserByName">
            select count(*) from user where name = #{param}
        </select>
    </mapper>

.. code-block:: go

    engine.Object("main.CountUserByName").QueryContext(context.TODO(), "eatmoreapple")

**自定义参数名：**

可以通过 ``paramName`` 属性来自定义单一参数的名称：

.. code-block:: xml

    <mapper namespace="main">
        <select id="CountUserByName" paramName="name">
            select count(*) from user where name = #{name}
        </select>
    </mapper>

或者通过环境变量 ``JUICE_PARAM_NAME`` 来全局设置。

**便捷类型：**

``juice.H`` 是一个 ``map[string]interface{}`` 的别名，用来方便开发者传递参数。

.. code-block:: go

    params := juice.H{
        "name": "eatmoreapple",
        "age":  25,
    }

    engine.Object("main.GetUser").QueryContext(context.TODO(), params)

.. attention::
    当参数是 map 类型时，这个 map 的 key 必须是 string 类型。

高级功能
--------


语句属性
~~~~~~~~

SQL 语句标签支持多种属性来控制执行行为：

.. code-block:: xml

    <mapper namespace="main">
        <select id="GetUser" 
                timeout="5000" 
                debug="false"
                paramName="userId">
            select * from user where id = #{userId}
        </select>
        
        <insert id="CreateUser" 
                useGeneratedKeys="true" 
                keyProperty="id">
            insert into user (name, email) values (#{name}, #{email})
        </insert>
    </mapper>

**常用属性说明：**

- ``timeout``: 设置 SQL 执行超时时间（毫秒）
- ``debug``: 是否启用调试模式
- ``paramName``: 自定义单一参数的名称
- ``useGeneratedKeys``: 是否使用自动生成的主键
- ``keyProperty``: 指定接收自动生成主键的属性名

最佳实践
--------

1. **命名规范**
   - 使用有意义的命名空间
   - SQL 语句 ID 应该清晰表达其功能
   - 参数名应该具有描述性

2. **文件组织**
   - 按功能模块划分 mapper 文件
   - 每个 mapper 文件不要过大
   - 使用合理的目录结构

3. **安全性**
   - 优先使用 ``#{}`` 参数语法
   - 避免直接拼接 SQL 字符串
   - 对输入参数进行验证

4. **性能优化**
   - 合理使用索引
   - 避免 SELECT *
   - 使用合适的数据类型

示例：完整的 Mapper 配置
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE mapper PUBLIC "-//juice.org//DTD Config 1.0//EN"
            "https://raw.githubusercontent.com/go-juicedev/juice/main/mapper.dtd">

    <mapper namespace="user.UserRepository">
        
        <!-- 基本查询 -->
        <select id="GetById">
            select id, name, email, age, created_at 
            from users 
            where id = #{id}
        </select>
        
        <!-- 分页查询 -->
        <select id="GetByPage">
            select id, name, email, age, created_at 
            from users 
            order by created_at desc 
            limit #{limit} offset #{offset}
        </select>
        
        <!-- 条件查询 -->
        <select id="GetByCondition">
            select id, name, email, age, created_at 
            from users 
            where 1=1
            <if test="name != nil and name != ''">
                and name like concat('%', #{name}, '%')
            </if>
            <if test="minAge != nil">
                and age >= #{minAge}
            </if>
            <if test="maxAge != nil">
                and age <= #{maxAge}
            </if>
            order by created_at desc
        </select>
        
        <!-- 创建用户 -->
        <insert id="Create" useGeneratedKeys="true" keyProperty="id">
            insert into users (name, email, age, created_at) 
            values (#{name}, #{email}, #{age}, now())
        </insert>
        
        <!-- 更新用户 -->
        <update id="Update">
            update users 
            set name = #{name}, 
                email = #{email}, 
                age = #{age},
                updated_at = now()
            where id = #{id}
        </update>
        
        <!-- 删除用户 -->
        <delete id="Delete">
            delete from users where id = #{id}
        </delete>
        
        <!-- 批量操作 -->
        <insert id="BatchInsert">
            insert into users (name, email, age, created_at) values
            <foreach collection="users" item="user" separator=",">
                (#{user.name}, #{user.email}, #{user.age}, now())
            </foreach>
        </insert>
        
    </mapper>

通过以上的配置和使用方式，您可以充分利用 Juice 的 SQL Mapper 功能来构建高效、安全的数据访问层。




