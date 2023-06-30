Search.setIndex({"docnames": ["cache", "code_generate", "configuration", "dynamic_sql", "eatmoreapple", "expr", "extension", "hot_reload", "index", "mappers", "middleware", "result_mapping", "tx"], "filenames": ["cache.rst", "code_generate.rst", "configuration.rst", "dynamic_sql.rst", "eatmoreapple.rst", "expr.rst", "extension.rst", "hot_reload.rst", "index.rst", "mappers.rst", "middleware.rst", "result_mapping.rst", "tx.rst"], "titles": ["\u7f13\u5b58", "\u4ee3\u7801\u751f\u6210", "\u914d\u7f6e\u8be6\u60c5", "\u52a8\u6001sql", "\u5403\u5305\u8fa3\u6761", "\u8868\u8fbe\u5f0f", "\u6269\u5c55", "\u70ed\u66f4\u65b0", "Juice \u7b80\u4ecb", "SQL mappers", "\u4e2d\u95f4\u4ef6", "\u7ed3\u679c\u96c6\u6620\u5c04", "\u4e8b\u52a1"], "terms": {"juic": [0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 12], "txcachemanag": [], "genericmanag": [9, 11], "manag": [1, 8, 11], "engin": [0, 1, 2, 7, 8, 9, 10, 11, 12], "cachetx": 0, "defer": [0, 10, 11, 12], "rollback": 12, "func": [0, 1, 2, 5, 6, 7, 8, 9, 10, 12], "countuserbyid": [], "count": [9, 11], "err": [1, 2, 5, 6, 7, 8, 9, 10, 11, 12], "newgenericmanag": [0, 1, 8, 9, 11, 12], "int": [0, 1, 5, 11, 12], "object": [0, 1, 8, 9, 12], "querycontext": [1, 6, 10, 11], "context": [0, 1, 6, 10, 11, 12], "background": 1, "xml": [1, 2, 3, 5, 7, 8, 9, 10, 11, 12], "version": [1, 2, 6, 8, 9], "encod": [1, 2, 6, 8, 9], "utf": [1, 2, 6, 8, 9], "sql": [1, 2, 5, 6, 7, 8, 10, 12], "default": [1, 2, 3, 8, 9, 10, 12], "prod": [1, 2, 8, 9], "id": [0, 1, 2, 3, 8, 9, 10, 11], "datasourc": [1, 2, 8, 9], "root": [1, 2, 8, 9], "qwe123": [1, 2, 8, 9], "tcp": [1, 2, 8, 9], "localhost": [1, 2, 8, 9], "3306": [1, 2, 8, 9], "databas": [1, 2, 8, 9, 11, 12], "driver": [1, 2, 8, 9, 11, 12], "mysql": [1, 2, 8, 9], "dev": 2, "foo": 2, "db": [2, 6, 12], "sqlite3": 2, "packag": [1, 2, 6, 8, 9], "main": [1, 2, 5, 6, 8, 9, 10, 11], "import": [1, 2, 6, 8, 9], "fmt": [1, 2, 6, 8, 9, 11], "github": [0, 1, 2, 6, 8, 9], "com": [0, 1, 2, 6, 8, 9], "eatmoreappl": [0, 1, 2, 5, 6, 8, 9], "go": [2, 5, 6, 8, 9, 10, 12], "cfg": [1, 2, 6, 7, 8, 9, 10, 12], "newxmlconfigur": [1, 2, 6, 7, 8, 9, 10, 12], "config": [1, 2, 6, 7, 8, 9, 10, 12], "if": [0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 12], "nil": [0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 12], "println": [1, 2, 6, 8, 9, 11], "return": [0, 1, 2, 5, 6, 8, 9, 10, 11, 12], "defaultengin": [1, 2, 7, 8, 9, 10, 12], "ping": 2, "connect": 2, "to": [2, 9, 10, 12], "env": 2, "data_sourc": 2, "envvalueprovid": 2, "defin": [2, 10], "valu": [0, 1, 2, 8, 9, 10, 11], "type": [0, 1, 2, 5, 6, 9, 10, 11, 12], "interfac": [0, 1, 2, 5, 6, 9, 10, 11, 12], "get": [0, 1, 2, 8, 10, 11], "key": [0, 1, 2, 3, 9], "string": [0, 1, 2, 5, 6, 8, 9, 10, 11], "error": [0, 1, 2, 5, 6, 10, 11, 12], "registerenvvalueprovid": 2, "regist": 2, "an": [2, 11, 12], "the": [0, 2, 6, 10, 12], "is": [0, 2, 6, 10, 11, 12], "name": [1, 2, 3, 5, 9, 10, 11], "of": [2, 6, 10, 11], "it": [0, 2], "allow": 2, "overrid": 2, "maxidleconnnum": 2, "10": [2, 10, 11], "maxopenconnnum": 2, "maxconnlifetim": 2, "3600": 2, "maxlifetim": [], "maxidleconnlifetim": 2, "debugmiddlewar": [0, 2, 10], "debug": [2, 10], "fals": [0, 2, 3, 5, 10], "test": [3, 5], "boolean": 3, "true": [1, 3, 5, 10, 11], "select": [0, 1, 3, 8, 11], "selectbycondit": 3, "from": [1, 3, 9, 10, 11], "user": [1, 3, 9, 11, 12], "and": [3, 6, 10], "or": [3, 10, 12], "age": [3, 9, 11], "updat": [0, 1, 3, 8], "updatebycondit": 3, "collect": [3, 11], "item": 3, "index": [3, 6], "open": [3, 8], "close": [3, 11], "separ": 3, "selectbyid": 3, "in": [3, 10, 12], "ids": 3, "prefix": 3, "prefixoverrid": 3, "suffix": 3, "suffixoverrid": 3, "switch": 3, "case": 3, "els": 3, "insert": [1, 3, 8, 10, 11], "action": [0, 1, 3, 9, 10, 11], "into": [1, 3, 9, 11], "column": [1, 3, 11], "uid": [3, 11], "create_at": 3, "now": [3, 10], "file": [3, 9], "as": [3, 8, 9, 11], "when": [5, 8], "length": 5, "map": [1, 3, 8, 11], "slice": 5, "substr": 5, "join": [5, 11], "contain": 5, "bool": [5, 10, 11, 12], "titl": 5, "lower": 5, "upper": 5, "emm": 5, "ok": 5, "add": 5, "registerevalfunc": 5, "panic": [1, 5, 6, 7, 10, 11, 12], "golang": 8, "mapper": [1, 6, 7, 8, 10, 11], "http": [8, 9], "18": [9, 11], "configur": [1, 6, 7, 8, 9, 10], "environ": [1, 8, 9], "namespac": [1, 8, 9, 11], "helloworld": [8, 9], "hello": [8, 9], "world": [8, 9], "messag": [8, 9], "usernam": [], "password": [], "host": [], "port": 9, "queri": [0, 6, 8, 9, 10, 11, 12], "run": [1, 8], "2022": 8, "11": [1, 8], "05": [1, 8], "19": [8, 9], "56": 8, "49": 8, "3138ms": 8, "provid": 8, "set": [0, 1, 8, 9, 10], "delet": [1, 8], "row": [6, 8, 10], "bindermanag": [], "resultmap": 11, "where": [1, 8, 9, 11], "foreach": 8, "trim": 8, "choos": 8, "otherwis": 8, "alia": 8, "field": 8, "resourc": [6, 9], "path_to_another_mapp": 9, "url": 9, "domain": 9, "path": 9, "your": [6, 9, 11, 12], "insertus": [9, 11], "updateus": 9, "deleteus": 9, "countuserbynam": 9, "table2": 9, "tabl": [1, 9, 11], "int64": [1, 9, 10, 11], "tag": [9, 10, 11], "param": [1, 5, 9, 11], "paramnam": 9, "juice_param_nam": 9, "queryhandl": [6, 10], "handler": 10, "ctx": [0, 1, 6, 10, 11, 12], "arg": [6, 10], "ani": [0, 1, 6, 10, 11, 12], "exechandl": [6, 10], "exec": [6, 10, 11], "result": [1, 6, 10, 11], "middlewar": [6, 10], "wrapper": [6, 10], "wrap": [6, 10], "stmt": [6, 10], "statement": [6, 10, 11], "next": [6, 10, 11], "execcontext": [1, 6, 10, 11], "logger": 10, "for": [0, 10, 11, 12], "var": [0, 1, 2, 6, 10, 11], "log": [6, 10], "new": [0, 1, 10], "writer": 10, "flag": 10, "that": [0, 2, 10, 12], "print": 10, "execut": 10, "time": [10, 11], "struct": [1, 2, 5, 6, 10, 11, 12], "implement": [0, 10], "will": 10, "isbugmod": 10, "start": 10, "spent": 10, "sinc": 10, "printf": 10, "x1b": 10, "33m": 10, "0m": 10, "32m": 10, "34m": 10, "31m": 10, "mode": 10, "on": 10, "you": 10, "can": 10, "turn": 10, "off": 10, "by": [1, 10], "attribut": 10, "tri": 10, "one": 10, "bug": 10, "not": [0, 1, 2, 10, 12], "consol": 10, "xxx": 10, "timeoutmiddlewar": 10, "timeout": 10, "selectus": 11, "scan": 11, "dest": 11, "statementidgett": 11, "statementid": 11, "pkgpath": 11, "methodnam": 11, "use": [2, 10, 12], "bind": [], "given": 12, "be": 12, "pointer": [], "newbindermanag": [], "list": [], "generic": 11, "lastinsertid": [1, 11], "usegeneratedkey": 11, "keyproperti": 11, "autoincr": 11, "newexecutor": 11, "oper": 12, "executor": [1, 12], "tx": [0, 12], "commit": [0, 12], "lo": [], "setconfigur": 7, "osenvvalueprovid": 2, "os": 2, "getenv": 2, "variabl": 2, "formatregexp": 2, "replaceallstringfunc": 2, "find": 2, "findstringsubmatch": 2, "len": [2, 6], "errorf": 2, "found": [0, 2], "regexp": 2, "mustcompil": 2, "za": 2, "z0": 2, "9_": 2, "tip": [], "binder": [], "c_time": 11, "limit": 11, "properti": 11, "queryuserlist": 11, "class": 11, "ifac": 1, "userdetail": 11, "idcard": 11, "id_card": 11, "user_detail": 11, "associ": 11, "queryus": 11, "detail": 11, "todo": [], "hobbi": 11, "user_hobbi": 11, "sas": [], "begintx": 12, "opt": 12, "txoption": 12, "hold": 12, "transact": 12, "option": 12, "isol": 12, "level": 12, "zero": 12, "isolationlevel": 12, "readon": 12, "various": 12, "may": 12, "support": 12, "doe": [0, 12], "see": 12, "https": [0, 1, 6, 12], "en": [6, 12], "wikipedia": 12, "org": [6, 12], "wiki": 12, "isolation_": 12, "database_system": 12, "isolation_level": 12, "const": 12, "leveldefault": 12, "iota": 12, "levelreaduncommit": 12, "levelreadcommit": 12, "levelwritecommit": 12, "levelrepeatableread": 12, "levelsnapshot": 12, "levelserializ": 12, "levellineariz": 12, "contexttx": 12, "txmanag": 12, "mymiddlewar": 10, "yourmiddlewareimpl": 10, "1000": 10, "rollbakc": 0, "obj": 0, "gettimeout": 10, "cancel": 10, "withtimeout": 10, "durat": 10, "millisecond": 10, "timeoutattr": 10, "strconv": 10, "parseint": 10, "64": 10, "flushcach": 0, "cach": 0, "errcachenotfound": 0, "exist": 0, "dst": 0, "flush": 0, "all": 0, "mycach": [], "mycacheimpl": 0, "setcachefactori": 0, "note": 0, "redi": 0, "juicectl": 1, "juicec": 8, "instal": 1, "creat": 1, "null": 1, "auto_incr": 1, "varchar": 1, "255": 1, "primari": 1, "innodb": 1, "charset": 1, "utf8": 1, "userrepositori": 1, "createus": 1, "managerfromcontext": 1, "deleteuserbyid": 1, "updateusernamebyid": 1, "getuserbyid": 1, "doctyp": 6, "public": 6, "dtd": 6, "raw": 6, "githubusercont": 6, "utf8mb4": 1, "amp": 1, "parsetim": 1, "impl": 1, "output": 1, "user_repo": 1, "code": 1, "generat": 8, "do": 1, "edit": 1, "userrepositoryimpl": 1, "result0": 1, "result1": 1, "ret": 1, "newuserrepositori": 1, "contextwithmanag": 1, "userrepo": 1, "2023": 1, "06": 1, "13": 1, "14": 1, "41": 1, "745625ms": 1, "483": 1, "166": 1, "mod": 1, "go1": 6, "16": 6, "emb": 6, "fs": 6, "newxmlconfigurationwithf": 6, "hook": [], "readwritemiddlewar": 6, "slave": 6, "master": 6, "rand": 6, "intn": 6, "withsess": [], "session": 6, "tracemiddlewar": 6, "trace": 6, "own": 6, "yet": 0, "sessionwithcontext": 6, "rootel": [], "filenam": [], "document": 6, "definit": 6, "uri": 6, "style": 1, "myfunc": 5, "20": 8, "str": 5}, "objects": {}, "objtypes": {}, "objnames": {}, "titleterms": {"configur": 2, "environ": 2, "provid": 2, "set": [2, 3], "sql": [3, 9, 11], "if": 3, "where": 3, "foreach": 3, "trim": 3, "choos": 3, "when": 3, "otherwis": 3, "valu": 3, "alia": 3, "field": 3, "juic": 8, "mapper": 9, "select": 9, "insert": 9, "updat": 9, "delet": 9, "map": [5, 9], "struct": 9, "row": 11, "object": 11, "executor": 11, "bindermanag": [], "binderexecutor": [], "binder": [], "genericmanag": [], "genericexecutor": 11, "resultmap": [], "manag": 12, "juicec": 1, "go": 1, "generat": 1, "xml": 6}, "envversion": {"sphinx.domains.c": 2, "sphinx.domains.changeset": 1, "sphinx.domains.citation": 1, "sphinx.domains.cpp": 8, "sphinx.domains.index": 1, "sphinx.domains.javascript": 2, "sphinx.domains.math": 2, "sphinx.domains.python": 3, "sphinx.domains.rst": 2, "sphinx.domains.std": 2, "sphinx.ext.viewcode": 1, "sphinx": 57}, "alltitles": {"\u4e8b\u52a1": [[12, "id1"]], "Manager": [[12, "manager"]], "\u5f00\u542f\u4e8b\u52a1": [[12, "id2"]], "\u9694\u79bb\u7ea7\u522b": [[12, "id3"]], "\u4e2d\u95f4\u4ef6": [[10, "id1"]], "\u4ec0\u4e48\u662f\u4e2d\u95f4\u4ef6": [[10, "id2"]], "\u81ea\u5b9a\u4e49\u4e2d\u95f4\u4ef6": [[10, "id3"]], "\u7ed3\u679c\u96c6\u6620\u5c04": [[11, "id1"]], "sql.Rows": [[11, "sql-rows"]], "Object": [[11, "object"]], "Executor": [[11, "executor"]], "\u6cdb\u578b\u7ed3\u679c\u96c6\u6620\u5c04": [[11, "id2"]], "GenericExecutor": [[11, "genericexecutor"]], "\u81ea\u5b9a\u4e49\u7ed3\u679c\u96c6\u6620\u5c04": [[11, "id3"]], "\u7b80\u5355\u67e5\u8be2": [[11, "id4"]], "\u4e00\u5bf9\u4e00\u67e5\u8be2": [[11, "id5"]], "\u4e00(\u591a)\u5bf9\u591a\u67e5\u8be2": [[11, "id6"]], "\u81ea\u589e\u4e3b\u952e\u6620\u5c04": [[11, "id7"]], "\u7f13\u5b58": [[0, "id1"]], "\u5f00\u542f\u7f13\u5b58": [[0, "id2"]], "\u7f13\u5b58\u5931\u6548": [[0, "id3"]], "\u81ea\u5b9a\u4e49\u7f13\u5b58": [[0, "id4"]], "\u4e8c\u7ea7\u7f13\u5b58": [[0, "id5"]], "\u914d\u7f6e\u8be6\u60c5": [[2, "id1"]], "configuring": [[2, "configuring"]], "environments": [[2, "environments"]], "provider": [[2, "provider"]], "\u8fde\u63a5\u6c60\u914d\u7f6e": [[2, "id2"]], "settings": [[2, "settings"]], "\u5403\u5305\u8fa3\u6761": [[4, "id1"]], "\u6269\u5c55": [[6, "id1"]], "\u914d\u7f6e\u6587\u4ef6\u6253\u5305\u5230\u53ef\u6267\u884c\u6587\u4ef6": [[6, "id2"]], "\u8bfb\u5199\u5206\u79bb": [[6, "id3"]], "\u94fe\u8def\u8ffd\u8e2a": [[6, "id4"]], "XML\u6587\u6863\u7ea6\u675f": [[6, "xml"]], "\u4ee3\u7801\u751f\u6210": [[1, "id1"]], "\u5b89\u88c5juicecli": [[1, "juicecli"]], "\u7b80\u5355\u4f7f\u7528": [[1, "id2"]], "\u63a5\u53e3\u7ea6\u675f": [[1, "id3"]], "go generate": [[1, "go-generate"]], "\u70ed\u66f4\u65b0": [[7, "id1"]], "SQL mappers": [[9, "sql-mappers"]], "mappers\u6807\u7b7e": [[9, "mappers"]], "mapper\u6807\u7b7e": [[9, "mapper"]], "select\uff0cinsert\uff0cupdate\uff0cdelete\u6807\u7b7e": [[9, "select-insert-update-delete"]], "\u63a5\u53d7\u53c2\u6570": [[9, "id1"]], "\u5b9a\u4e49\u53c2\u6570\u5b9e\u4f8b": [[9, "id2"]], "\u53c2\u6570\u67e5\u627e": [[9, "id3"]], "\u53c2\u6570\u4f20\u9012": [[9, "id4"]], "map-struct\u53c2\u6570": [[9, "map-struct"]], "\u975emap-struct\u7684\u53c2\u6570\u4f20\u9012": [[9, "id5"]], "H": [[9, "h"]], "Juice \u7b80\u4ecb": [[8, "juice"], [8, null]], "\u9879\u76ee\u4e3b\u9875": [[8, "id1"]], "\u7279\u6027": [[8, "id2"]], "\u5b89\u88c5": [[8, "id3"]], "\u5feb\u901f\u5f00\u59cb": [[8, "id4"]], "\u8be6\u7ec6\u6587\u6863": [[8, "id5"]], "\u8868\u8fbe\u5f0f": [[5, "id1"], [5, "id2"]], "\u6bd4\u8f83\u8fd0\u7b97\u7b26": [[5, "id3"]], "\u903b\u8f91\u8fd0\u7b97\u7b26": [[5, "id4"]], "\u7b97\u672f\u8fd0\u7b97\u7b26": [[5, "id5"]], "\u4fdd\u7559\u5173\u952e\u5b57": [[5, "id6"]], "\u51fd\u6570": [[5, "id7"]], "\u81ea\u5b9a\u4e49\u5168\u5c40\u51fd\u6570\u6ce8\u518c": [[5, "id8"]], "\u4f20\u5165\u51fd\u6570\u8c03\u7528": [[5, "id9"]], "\u81ea\u5b9a\u4e49\u7c7b\u578b\u65b9\u6cd5\u8c03\u7528": [[5, "id10"]], "\u5c5e\u6027\u8c03\u7528": [[5, "id11"]], "map\u7d22\u5f15\u53d6\u503c": [[5, "map"]], "\u6570\u7ec4\u7d22\u5f15\u53d6\u503c": [[5, "id12"]], "\u52a8\u6001sql": [[3, "sql"]], "if": [[3, "if"]], "where": [[3, "where"]], "set": [[3, "set"]], "foreach": [[3, "foreach"]], "trim": [[3, "trim"]], "choose\u3001when\u548cotherwise": [[3, "choosewhenotherwise"]], "values\u3001value": [[3, "valuesvalue"]], "alias\u3001field": [[3, "aliasfield"]]}, "indexentries": {}})