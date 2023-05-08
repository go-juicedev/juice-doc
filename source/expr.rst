表达式
========

从上面的动态sql里面我们可以看出 juice 支持在 ``if`` 和 ``when`` 标签中使用表达式，这些表达式的语法和 go 语言中的语法基本一致。

你可以在表达式里面书写大部分的 go 语言表达式，但是有一些特殊的地方需要注意：

1. juice 采用的是值传递，当你传递的是一个指针的时候，juice会将指针所指向的值传递给模板，而不是指针本身。所以无法比较一个元素是否为 `nil`。

2. juice 只支持单行表达式，不支持多行表达式。

3. 当在表达式里面写一个字符串的时候，需要将test属性的的值用单引号包裹起来，例如：

   .. code:: xml

        <if test='name == "eatmoreapple"'>

        </if>

4. 尽量写简单一点的表达式。


函数
-------

为了丰富表达式的功能，juice 支持在表达式里面调用函数。

juice 内置了一些函数，你可以在表达式里面使用。

1. ``length``: 返回字符串的长度，或者数组、切片、map的长度。

    .. code::

       func length[T slice|map|string](T) int

2. ``substr``: 返回字符串的子串，第一个参数是字符串，第二个参数是开始位置，第三个参数是结束位置。

    .. code::

       func substr(string, int, int) string


3. ``join``: 将字符串数组或者字符串切片转换成字符串，第一个参数是数组或者切片，第二个参数是分隔符。

    .. code::

       func join[T slice](T, string) string

4. ``contains``: 判断字符串、切片、map中是否包含制定元素

    .. code::

       func contains[T slice|map|string](T, interface{}) bool

5. ``slice``: 将数组或者切片进行切片，第一个参数是数组或者切片，第二个参数是开始位置，第三个参数是结束位置。

    .. code::

       func slice[T slice](T, int, int) T

6. ``title``: 将字符串的首字母大写。

    .. code::

       func title(string) string

7. ``lower``: 将字符串转换成小写。

        .. code::

        func lower(string) string

8. ``upper``: 将字符串转换成大写。

        .. code::

        func upper(string) string

自定义函数
-----------

当我觉得内置的函数不够用的时候，我可以自定义函数，自定义函数需要满足以下条件：

1. 必须是一个函数（emm，这个很好理解）。

2. 必须有一个返回值，类型可以是任意类型。

ok，当满足上述两个条件之后，我们就可以往juice里面注册自定义函数了。

.. code:: go

    func add(x, y int) int {
        return x + y
    }

    func main() {
        if err := juice.RegisterEvalFunc("add", add); err != nil {
            panic(err)
        }
    }

在上面的代码中，我们定义了一个 ``add`` 函数，然后我们调用 ``RegisterEvalFunc`` 方法将这个函数注册到 juice 里面。

在 juice 里面，我们可以这样使用这个函数：

.. code:: xml

    <if test='add(1, 2) == 3'>

    </if>




