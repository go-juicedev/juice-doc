goland 插件
=============

简介
----

Juice GoLand 插件是一个专门为 Juice 框架开发的 IDE 工具，它能够显著提升开发效率和用户体验。通过提供智能跳转、自动补全等功能，让开发者能够更轻松地在 XML 配置和 Go 代码之间进行切换。

安装方法
--------

有两种方式可以安装 Juice GoLand 插件：

1. 通过 IDE 插件市场安装
   - 打开 GoLand IDE
   - 进入 Settings/Preferences -> Plugins
   - 切换到 Marketplace 标签页
   - 搜索 "Juice"
   - 点击 Install 按钮安装

2. 手动安装
   - 从 GitHub Release 页面下载最新版本的插件包（.zip文件）
   - 打开 GoLand IDE
   - 进入 Settings/Preferences -> Plugins
   - 点击齿轮图标，选择 "Install Plugin from Disk"
   - 选择下载的插件包进行安装

主要功能
--------

1. 智能跳转
   - XML 到 Go 接口的快速跳转：在 XML 文件中按住 Ctrl/Cmd 点击接口名称即可跳转到对应的 Go 接口定义
   - Go 接口到 XML 的反向跳转：在 Go 接口定义处使用 Alt + B 或右键菜单可跳转到对应的 XML 配置

2. 自动补全
   - XML namespace 自动补全：输入时自动提示和补全 namespace
   - 接口方法补全：在 XML 中编写方法时提供智能提示和补全
   - 参数名称补全：自动补全方法参数名称

3. 语法高亮
   - XML 文件中的 SQL 语句语法高亮
   - 配置标签和属性的语法高亮
   - 错误语法提示

4. 代码检查
   - XML 配置文件的语法检查
   - 接口方法签名匹配检查
   - namespace 正确性验证

使用示例
--------

1. XML 到 Go 接口跳转示例：

.. code-block:: xml

    <mapper namespace="github.com.example.repo.UserMapper">
        <!-- 在 namespace 值上按住 Ctrl/Cmd 并点击即可跳转到 UserMapper 接口定义 -->
    </mapper>

2. namespace 自动补全：

.. code-block:: xml

    <mapper namespace="github.com.example.repo.UserM"> <!-- 输入时会自动提示可用的 namespace -->

3. SQL 语法高亮：

.. code-block:: xml

    <select id="getUserById">
        SELECT * FROM users WHERE id = #{id} <!-- SQL 语句会有语法高亮 -->
    </select>

快捷键
-------

- Ctrl/Cmd + 点击：跳转到定义
- Alt + B：查找使用处
- Ctrl/Cmd + Space：触发自动补全
- Alt + Enter：显示意图操作和快速修复

常见问题
--------

1. 插件无法安装
   - 确保 GoLand 版本兼容（支持 2023.1 及以上版本）
   - 检查网络连接是否正常
   - 尝试手动安装方式

2. 跳转功能不工作
   - 确保项目正确配置了 GOPATH
   - 检查 XML 文件中的 namespace 是否正确
   - 确保 Go 接口文件已经正确导入

3. 自动补全不生效
   - 检查是否启用了自动补全功能
   - 确保项目索引已经建立完成
   - 尝试重建项目索引

反馈与支持
---------

如果您在使用过程中遇到任何问题或有改进建议，欢迎通过以下方式反馈：

- 在 GitHub 项目中提交 Issue
- 通过官方文档评论区反馈
- 发送邮件到支持邮箱