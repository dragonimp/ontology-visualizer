# P005 Ontology 测试案例

> 最后更新：2026-05-24
> 测试环境：zz.impx.net

## 测试环境

| 项 | 值 |
|----|-----|
| **前端域名** | https://ontology.ai.impx.net / https://ontology3d.ai.impx.net |
| **Flask API** | http://localhost:5005 |
| **Flask API 路径** | /var/www/html/ontology/ontology_visualizer/ |

---

## P 核心功能

### TC-P005-001 主页访问
- **优先级**: P0
- **步骤**: 访问 https://ontology.ai.impx.net
- **预期**: HTTP 200，页面正常加载，显示RDF/OWL本体可视化界面

### TC-P005-002 静态文件服务
- **优先级**: P0
- **步骤**: 访问 /风控模型.ttl
- **预期**: HTTP 200，返回本体文件内容

### TC-P005-003 Flask API 上传接口
- **优先级**: P0
- **步骤**: POST /api/upload 带 RDF/OWL 文件
- **预期**: HTTP 200/400，文件解析成功返回节点和边数据

### TC-P005-004 Flask API 查询接口
- **优先级**: P0
- **步骤**: POST /api/query 发送 SPARQL 查询
- **预期**: HTTP 200/400，返回查询结果

## P1 辅助功能

### TC-P005-005 双域名访问
- **优先级**: P1
- **步骤**: 分别访问 ontology.ai.impx.net 和 ontology3d.ai.impx.net
- **预期**: 两个域名均返回 HTTP 200

### TC-P005-006 Flask 端口切换 5005
- **优先级**: P1
- **步骤**: 访问 http://localhost:5005/
- **预期**: HTTP 200，gunicorn 运行在 5005 端口
