## Juice Document

Juice 是一个用 Go 语言编写的 SQL Mapper 框架。它的设计目标是简化数据库操作，使开发人员能够更加专注于业务逻辑的实现，而不是繁琐的数据库交互细节。Juice 提供了强大的功能集，同时保持了轻量级和高性能的特性。

### 主要特性

*   **轻量级与高性能**：无外部第三方依赖，核心代码精简高效。
*   **动态 SQL**：通过 XML 配置或代码内构建灵活的 SQL 语句，支持条件判断、循环等逻辑。
*   **多数据源支持**：轻松配置和切换多个数据库环境（如开发、测试、生产），并支持读写分离。
*   **泛型结果集映射**：利用 Go 泛型将查询结果安全、便捷地映射到结构体或基本类型。
*   **中间件架构**：可扩展的中间件支持，用于实现日志记录、性能监控、事务感知的数据源切换等高级功能。
*   **代码生成工具 (`juicecli`)**：自动化生成 Mapper 接口的实现代码，减少重复劳动。
*   **强大的表达式系统**：在动态 SQL 中使用类似 Go 语法的表达式进行条件判断和数据处理。
*   **GoLand 插件**：提供 IDE 集成，增强开发体验，如 XML 与 Go 代码间的智能跳转和自动补全。
*   **事务管理**：提供全面的事务支持，包括嵌套事务和隔离级别控制。
*   **原始 SQL 执行**：支持直接执行原生 SQL 语句。
*   **XML 文档约束**：支持 DTD 和 XSD，确保 Mapper 配置文件的规范性和正确性。

### 快速开始

#### 1. 安装 Juice

```bash
go get -u github.com/go-juicedev/juice
```
*(请确保你的 Go 版本 >= 1.24)*

#### 2. 配置 SQL Mapper

创建一个 `config.xml` 文件（或你选择的其他名称）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <environments default="dev">
        <environment id="dev">
            <!-- 替换为你的数据库连接字符串 -->
            <dataSource>user:password@tcp(127.0.0.1:3306)/database_name?charset=utf8mb4&parseTime=True&loc=Local</dataSource>
            <driver>mysql</driver> <!-- 确保已导入相应的数据库驱动 -->
        </environment>
    </environments>

    <mappers>
        <mapper namespace="main">
            <select id="GetMessage">
                select "Hello, Juice!" as message
            </select>
        </mapper>
    </mappers>
</configuration>
```

#### 3. Go 代码示例

```go
package main

import (
	"context"
	"fmt"
	"github.com/go-juicedev/juice"
	_ "github.com/go-sql-driver/mysql" // 导入 MySQL 驱动示例
)

// 定义一个与 Mapper 中 select 语句对应的函数签名
// 函数名 GetMessage 对应 <select id="GetMessage">
func GetMessage() {}

func main() {
	// 加载配置文件
	cfg, err := juice.NewXMLConfiguration("config.xml")
	if err != nil {
		panic(fmt.Errorf("加载配置文件失败: %w", err))
	}

	// 初始化 Juice 引擎
	engine, err := juice.Default(cfg)
	if err != nil {
		panic(fmt.Errorf("初始化 Juice 引擎失败: %w", err))
	}
	defer engine.Close() // 在程序结束时关闭引擎资源

	// 执行查询
	// 使用泛型指定期望的返回类型为 string
	// Object(GetMessage) 会将函数 GetMessage 与 config.xml 中 namespace="main" 下 id="GetMessage" 的 select 语句关联
	message, err := juice.NewGenericManager[string](engine).Object(GetMessage).QueryContext(context.Background(), nil)
	if err != nil {
		panic(fmt.Errorf("执行查询失败: %w", err))
	}

	fmt.Println(message) // 输出: Hello, Juice!
}
```

### 文档

更详细的文档和高级用法，请参考：
*   [Read the Docs](https://pkg.go.dev/github.com/go-juicedev/juice) (API 参考)
*   [项目内详细文档](./source/index.rst) (如果项目使用 Sphinx 生成文档)

### 如何贡献

我们欢迎社区的贡献！如果您有兴趣参与 Juice 项目的开发，请：
1.  Fork 本仓库。
2.  创建您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  将您的更改推送到分支 (`git push origin feature/AmazingFeature`)。
5.  开启一个 Pull Request。

或者，您可以查阅 `CONTRIBUTING.md` (如果存在) 获取更详细的贡献指南。

### 支持一下作者

如果您觉得 Juice 对您有所帮助，可以考虑支持一下作者：

![微信赞赏码](https://raw.githubusercontent.com/eatmoreapple/eatmoreapple/main/img/wechat_pay.jpg)

(二维码来自 `source/eatmoreapple.rst`)
