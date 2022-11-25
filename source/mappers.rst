SQL mappers
================

当我们将数据源信息配置好之后，我们就可以使用SQL Mapper来访问数据库了。 首先，我们得需要告诉juice去哪里找到我们的sql语句。

mappers标签
----------------

mappers 是mapper标签的父标签，它是一个集合标签，用来存放mapper标签。

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

        </mappers>
    </configuration>


mapper标签
----------------

mapper标签是用来存储sql语句的集合标签。

简单的例子：

.. code-block:: xml

   <mappers>
        <mapper namespace="main">
            <select id="HelloWorld">
                select "hello world" as message
            </select>
        </mapper>

        <mapper resource="path_to_another_mapper.xml"/>
        <mapper url="http(s)://domain:port/path"/>
        <mapper url="file://path to your mapper"/>

    </mappers>

- .. class:: namespace: 用来指定mapper的命名空间，这个命名空间是用来区分不同mapper的，它的值必须是一个唯一的。
- .. class:: resource: 用来引用另外一个mapper文件，注意：引用的mapper文件如果没有再次引用别的文件，那么它的namespace属性是必须的。
- .. class:: url: 通过url来引用mapper文件。目前支持http和file协议。如果引用的mapper文件没有再次引用别的文件，那么它的namespace属性是必须的。

通过引用mapper文件，我们可以将sql语句分散到不同的文件中，这样可以使得我们的结构更加清晰。


select，insert，update，delete标签
----------------

select标签用来存储select语句。 select标签必须在mapper标签中才能使用。

.. code-block:: xml

   <mapper namespace="main">
        <select id="HelloWorld">
            select * from user
        </select>

        <insert id="insertUser">
            insert into user (name, age) values ("eatmoreapple", 18)")
        </insert>

        <update id="updateUser">
            update user set age = 19 where name = "eatmoreapple"
        </update>

        <delete id="deleteUser">
            delete from user where name = "eatmoreapple"
        </delete>
    </mapper>


上述的select，insert，update，delete标签都是sql语句的集合标签，它们都有一个id属性，这个属性是用来标识sql语句的，它的值在同一个mapper中必须是唯一的。

接受参数
----------------

我们可以在我们的sql语句中使用参数，这些参数可以通过外部传递进来，我们只需要通过特定的语法来引用这些参数即可。

定义参数实例
~~~~~~~~~~~~~~~~

.. code-block:: xml

   <mapper namespace="main">
        <select id="CountUserByName">
            select count(*) from user where name = #{name}
        </select>
    </mapper>

上述的sql语句中，我们使用了#{name}来引用参数，这个参数的值将会在执行sql语句的时候传递进来。

#{}的语法会在运行时被替换成占位符，这样可以防止sql注入。但是，如果我们需要使用字符串拼接的方式来构造sql语句，那么我们就需要使用${}来引用参数了。

.. code-block:: xml

   <mapper namespace="main">
        <select id="CountUserByName">
            select count(*) from user where name = ${name}
        </select>
    </mapper>

上述的sql语句中，我们使用了${name}来引用参数，这个参数的值将会在执行sql语句的时候传递进来。

但是，${}的语法不会被替换成占位符，这样就会导致sql注入的问题。所以，我们在使用${}的时候，必须要保证参数的值是安全的。


参数查找
~~~~~~~~~~~~~~~~
无论是`#{}`还是 `${}`，都会在执行sql语句的时候，从参数中查找对应的值。参数的查找规则如下：

- #{}语法只会在参数中查找对应的值，如果找不到，那么就会抛出异常。
- ${}语法会在参数中查找对应的值，如果找不到，那么它会从当前的action标签中查找对应的值，如果还是找不到，那么它会从当前的mapper标签中查找对应的值，如果还是找不到，那么就会抛出异常。

.. code-block:: xml

   <mapper namespace="main" table2=user>
        <select id="CountUserByName" table="user">
            select count(*) from ${table} where name = ${name}
        </select>

        <select id="CountUserByName">
            select count(*) from ${table2} where name = ${name}
        </select>
    </mapper>

如上实例，这两个select是等价的。


参数传递
~~~~~~~~~~~~~~~~

.. code-block:: go

    package main

    import (
        "fmt"
        "github.com/eatmoreapple/juice"
        _ "github.com/go-sql-driver/mysql"
    )

    func CountUserByName() {}

    func main() {
        cfg, err := juice.NewXMLConfiguration("config.xml")
        if err != nil {
            fmt.Println(err)
            return
        }

        engine, err := juice.DefaultEngine(cfg)
        if err != nil {
            fmt.Println(err)
            return
        }

        count, err := juice.NewGenericManager[int64](engine).Object(CountUserByName).Query(map[string]interface{}{
            "name": "eatmoreapple",
        })
        if err != nil {
            fmt.Println(err)
            return
        }
        fmt.Println(count)
    }






