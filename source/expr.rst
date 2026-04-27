表达式系统
==========

概述
----

从上面的动态sql里面我们可以看出 juice 支持在 ``if`` 和 ``when`` 标签中使用表达式，这些表达式的语法和 go 语言中的语法基本一致。

使用限制
--------

1. juice 只支持单行表达式，不支持多行表达式。

2. 当在表达式里面写一个字符串的时候，需要将test属性的的值用单引号包裹起来，例如：

   .. code:: xml

        <if test='name == "eatmoreapple"'>
        </if>

3. 尽量写简单一点的表达式。

基本运算符
----------

比较运算符
~~~~~~~~~~

juice 支持以下比较运算符：

1. ``==``: 判断两个值是否相等。
2. ``!=``: 判断两个值是否不相等。
3. ``>``: 判断左边的值是否大于右边的值。
4. ``>=``: 判断左边的值是否大于等于右边的值。

.. attention::

    ``<`` 和 ``<=`` 不支持，因为它们会跟xml的语法冲突。那么怎么办呢？我们可以使用 ``&lt;`` 和 ``&lt;=`` 来代替 ``<`` 和 ``<=``。

逻辑运算符
~~~~~~~~~~

juice 支持以下逻辑运算符：

1. ``and``: 逻辑与。
2. ``or``: 逻辑或。
3. ``!``: 逻辑非。

算术运算符
~~~~~~~~~~

juice 支持以下算术运算符：

1. ``+``: 加法运算。
2. ``-``: 减法运算。
3. ``*``: 乘法运算。
4. ``/``: 除法运算。
5. ``%``: 取余运算。

保留关键字
~~~~~~~~~~

保留关键字是指 juice 里面已经定义好的关键字，不能用作变量名：

1. ``true``: 布尔类型的真。
2. ``false``: 布尔类型的假。
3. ``nil``: 空值。
4. ``and``: 逻辑与。
5. ``or``: 逻辑或。

内置函数
--------

juice 内置了一些常用函数。这些函数由 ``github.com/go-juicedev/juice/eval`` 包注册，可直接在动态 SQL 表达式中使用。

1. ``len``: 返回字符串、数组、切片、map 或 channel 的长度。

    .. code-block:: go

       func len(any) (int, error)

2. ``substr``: 返回字符串的子串。

    .. code-block:: go

       func substr(string, int, int) (string, error)

3. ``join``: 将字符串数组或切片用分隔符连接。

    .. code-block:: go

       func join(any, string) (string, error)

4. ``slice``: 对数组或切片进行切片操作。

    .. code-block:: go

       func slice(any, int, int) ([]any, error)

5. ``lower``: 转换为小写。

    .. code-block:: go

       func lower(string) (string, error)

6. ``upper``: 转换为大写。

    .. code-block:: go

       func upper(string) (string, error)

7. ``trim``、``trimLeft``、``trimRight``: 去除字符串两端或指定方向的字符。

    .. code-block:: go

       func trim(string, string) (string, error)

8. ``replace`` 和 ``replaceAll``: 替换字符串中的子串。

    .. code-block:: go

       func replace(string, string, string, int) (string, error)
       func replaceAll(string, string, string) (string, error)

9. ``split``、``splitN``、``splitAfter``: 分割字符串。

    .. code-block:: go

       func split(string, string) ([]string, error)
       func splitN(string, string, int) ([]string, error)
       func splitAfter(string, string) ([]string, error)

自定义函数
----------

注册条件：

1. 必须是一个函数
2. 必须有两个返回值，第一个返回值是任意类型，第二个必须为error类型

示例代码：

.. code:: go

    func add(x, y int) (int, error) {
        return x + y, nil
    }

    func main() {
        if err := eval.RegisterEvalFunc("add", add); err != nil {
            panic(err)
        }
    }

注册自定义函数时，需要显式导入 ``eval`` 包：

.. code-block:: go

    import "github.com/go-juicedev/juice/eval"

使用示例：

.. code:: xml

    <if test='add(1, 2) == 3'>
    </if>

函数调用
--------

基本函数调用：

.. code-block:: xml

    <if test='MyFunc() == "eatmoreapple"'>
    </if>

.. code-block:: go

    func MyFunc() (string, error) {
        return "eatmoreapple", nil
    }

    param := juice.H{
        "MyFunc": MyFunc,
    }

带参数函数：

.. code-block:: xml

    <if test='MyFunc("eatmoreapple") == "eatmoreapple"'>
    </if>

.. code-block:: go

    func MyFunc(str string) (string, error) {
        return str, nil
    }

    param := juice.H{
        "MyFunc": MyFunc,
    }

参数引用：

.. code-block:: xml

    <if test='MyFunc(eatmoreapple) == "eatmoreapple"'>
    </if>

.. code-block:: go

    param := juice.H{
        "MyFunc": MyFunc,
        "eatmoreapple": "eatmoreapple",
    }

多参数函数：

.. code-block:: xml

    <if test='MyFunc(eatmoreapple, 1, 2) == "eatmoreapple"'>
    </if>

.. code-block:: go

    func MyFunc(str string, x, y int) (string, error) {
        return str, nil
    }

自定义类型方法
--------------

方法调用：

.. code-block:: xml

    <if test='a.MyFunc() == "eatmoreapple"'>
    </if>

.. code-block:: go

    type A struct {
        Name string
    }

    func (a *A) MyFunc() (string, error) {
        return a.Name, nil
    }

    param := juice.H{
        "a": &A{Name: "eatmoreapple"},
    }

属性访问
--------

结构体属性：

.. code-block:: xml

    <if test='a.Name == "eatmoreapple"'>
    </if>

.. code-block:: go

    type A struct {
        Name string
    }

    param := juice.H{
        "a": &A{Name: "eatmoreapple"},
    }

Map操作
-------

索引访问：

.. code-block:: go

    param := juice.H{
        "a": juice.H{
            "Name": "eatmoreapple",
        },
    }

.. code-block:: xml

    <if test='a["Name"] == "eatmoreapple"'>
    </if>

    <!-- 或使用点号访问 -->
    <if test='a.Name == "eatmoreapple"'>
    </if>

.. attention::

    区别：
    1. 索引访问（``a["Name"]``）在key不存在时返回默认值
    2. 点号访问（``a.Name``）在属性不存在时抛出异常
    3. 点号访问支持方法调用

数组操作
--------

.. code-block:: xml

    <if test='a[0] == "eatmoreapple"'>
    </if>

.. code-block:: go

    param := juice.H{
        "a": []string{"eatmoreapple"},
    }

也支持切片表达式：

.. code-block:: xml

    <if test='len(a[1:]) > 0'>
    </if>

    <if test='len(a[start:end]) > 0'>
    </if>

下标和切片边界必须计算为整数类型。单个负数下标会从数组或切片末尾开始计数，例如 ``a[-1]`` 返回最后一个元素。

.. tip::
    最佳实践：

    1. 保持表达式简单明了
    2. 复杂逻辑建议在Go代码中处理
    3. 合理使用内置函数
    4. 注意XML特殊字符转义
    5. 测试所有条件分支