动态sql
============


动态sql是指在运行时根据条件动态生成sql语句的sql语句。juice 提供了动态sql的支持，可以通过动态sql来实现动态的sql语句。动态sql的语法和xml语法类似，但是动态sql的语法更加简单，更加灵活。动态sql的语法主要包括if、where、set、foreach、trim、choose、when、otherwise等。下面我们来看看这些语法的使用方法。

if
----

if语句用来判断条件，如果条件成立，则执行if语句中的sql语句，否则不执行。if语句的语法如下：

<if test="条件表达式">sql语句</if>

其中，条件表达式可以是任意的表达式，表达式的值必须是boolean类型。如果条件表达式的值为true，则执行if语句中的sql语句，否则不执行。下面我们来看一个例子：

.. code-block:: xml

    <select id="SelectByCondition">
        select * from user
        <if test='name != ""'>
            where name = #{name}
        </if>
    </select>

上面的例子中，如果name的值不为空，则在sql语句中添加where name = #{name}，否则不添加。如果name的值为空，则生成的sql语句为select * from user。

where
-----

where语句用来判断条件，如果条件成立，则执行where语句中的sql语句，否则不执行。where语句的语法如下：

.. code-block:: xml

    <where>
        <if test="条件表达式">sql语句</if>
        <if test="条件表达式">sql语句</if>
        ...
    </where>

where语句中可以包含多个if语句，如果where语句中的所有if语句的条件表达式的值都为false，则不执行where语句中的sql语句。如果where语句中的所有if语句的条件表达式的值都为true，则执行where语句中的sql语句。如果where语句中的if语句的条件表达式的值不全为true或false，则执行where语句中的sql语句，并且去除多余的and 和 or。下面我们来看一个例子：

.. code-block:: xml

    <select id="SelectByCondition">
        select * from user
        <where>
            <if test='name != ""'>
                and name = #{name}
            </if>
            <if test='age != 0'>
                and age = #{age}
            </if>
        </where>
    </select>

上面的例子中，如果name的值不为空，则在sql语句中添加 where name = #{name}，否则不添加。

如果age的值不为0，则在sql语句中添加where age = #{age}，否则不添加。

如果name的值为空，age的值为0，则生成的sql语句为select * from user。

如果name的值不为空，age的值不为0，则生成的sql语句为select * from user where name = #{name} and age = #{age}。

set
---

set语法用于更新语句中，用来设置更新的字段，它会在set语句中去除多余的逗号。set语法的语法如下：

.. code-block:: xml

    <set>
        <if test="条件表达式">sql语句</if>
        <if test="条件表达式">sql语句</if>
        ...
    </set>

set语句中可以包含多个if语句，如果set语句中的所有if语句的条件表达式的值都为false，则不执行set语句中的sql语句。如果set语句中的所有if语句的条件表达式的值都为true，则执行set语句中的sql语句。如果set语句中的if语句的条件表达式的值不全为true或false，则执行set语句中的sql语句，并且去除多余的逗号。下面我们来看一个例子：

.. code-block:: xml

    <update id="UpdateByCondition">
        update user
        <set>
            <if test='name != ""'>
                name = #{name},
            </if>
            <if test='age != 0'>
                age = #{age},
            </if>
        </set>
        where id = #{id}
    </update>


上面的例子中，如果name的值不为空，则在sql语句中添加name = #{name}，否则不添加。sql 语句为update user SET name = #{name} where id = #{id}。

如果age的值不为0，则在sql语句中添加age = #{age}，否则不添加。sql 语句为update user SET age = #{age} where id = #{id}。

如果name的值为空，age的值为0，则生成的sql语句为update user where id = #{id}。错误的sql语句。

如果name的值不为空，age的值不为0，则生成的sql语句为update user SET name = #{name}, age = #{age} where id = #{id}。

foreach
-------

foreach语句用来遍历集合，将集合中的元素作为参数传递给sql语句。foreach语句的语法如下：

.. code-block:: xml

    <foreach collection="集合" item="元素" index="索引" open="开始符" close="结束符" separator="分隔符">
        sql语句
    </foreach>

其中，collection属性用来指定集合，item属性用来指定集合中的元素，index属性用来指定集合中的索引，open属性用来指定开始符，close属性用来指定结束符，separator属性用来指定分隔符。下面我们来看一个例子：

.. code-block:: xml

    <select id="SelectByIds">
        select * from user where id in
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </select>

上面的例子中，将ids集合中的元素作为参数传递给sql语句，生成的sql语句为select * from user where id in (?, ?, ?)。 ? 为占位符（不同的驱动占位符不同），实际的值为ids集合中的元素。


trim
----

trim语句用来去除sql语句中开头和结尾的多余的关键字，例如and和or。trim语句的语法如下：

.. code-block:: xml

    <trim prefix="前缀" prefixOverrides="前缀覆盖" suffix="后缀" suffixOverrides="后缀覆盖">
        sql语句
    </trim>


其中，prefix属性用来设置要添加到sql语句开头的关键字，suffix属性用来设置要添加到sql语句结尾的关键字，prefixOverrides属性用来设置要去除的前缀关键字列表，suffixOverrides属性用来设置要去除的后缀关键字列表。如果prefix属性和suffix属性都不设置，则不添加前缀和后缀关键字；如果prefixOverrides属性和suffixOverrides属性都不设置，则不去除前缀和后缀关键字。下面我们来看一个例子：


.. code-block:: xml

    <select id="SelectByCondition">
        select * from user
        <trim prefix="where" prefixOverrides="and | or">
            <if test='name != ""'>
                and name = #{name}
            </if>
            <if test='age != 0'>
                and age = #{age}
            </if>
        </trim>
    </select>


上面的例子中，如果name的值不为空，则在sql语句中添加where name = #{name}，否则不添加。如果age的值不为0，则在sql语句中添加where age = #{age}，否则不添加。如果name的值为空，age的值为0，则生成的sql语句为select * from user。如果name的值不为空，age的值不为0，则生成的sql语句为select * from user where name = #{name} and age = #{age}。

choose、when和otherwise
------

choose、when、otherwise语句用来实现类似于switch语句的功能。choose语句相当于switch语句，when语句相当于case语句，otherwise语句相当于default语句。choose、when、otherwise语句的语法如下：
.. code-block:: xml

    <choose>
        <when test="条件表达式">sql语句</when>
        <when test="条件表达式">sql语句</when>
        ...
        <otherwise>sql语句</otherwise>
    </choose>


其中，when语句用来实现if语句的效果，otherwise语句用来实现else语句的效果。下面我们来看一个例子：

.. code-block:: xml

    <select id="SelectByCondition">
        select * from user
        <where>
            <choose>
                <when test='name != ""'>
                    and name = #{name}
                </when>
                <when test='age != 0'>
                    and age = #{age}
                </when>
                <otherwise>
                    and name = #{name} and age = #{age}
                </otherwise>
            </choose>
        </where>
    </select>


上面的例子中，如果name的值不为空，则在sql语句中添加and name = #{name}，否则不添加。如果age的值不为0，则在sql语句中添加and age = #{age}，否则不添加。如果name的值为空，age的值为0，则生成的sql语句为select * from user where name = #{name} and age = #{age}。如果name的值不为空，age的值不为0，则生成的sql语句为select * from user where and name = #{name} and age = #{age}。


otherwise语句用来实现else语句的效果，otherwise语句的语法如下：

.. code-block:: xml

    <otherwise>
        sql语句
    </otherwise>

当choose语句中的所有when语句的条件表达式都不成立时，执行otherwise语句。




