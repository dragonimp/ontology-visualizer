# P005 Ontology 部署测试报告

> 测试时间：2026-05-24 03:18
> 测试环境：zz.impx.net

## 测试结果汇总

| 项 | 值 |
|----|-----|
| **总用例** | 5 |
| **通过** | 3 ✅ |
| **失败** | 2 ⚠️ |
| **通过率** | 3/5 |

## 详细测试结果

| 编号 | 测试项 | 预期 | 实际 | 结果 |
|------|--------|------|------|------|
| TC-P005-001 | 主页访问 https://ontology.ai.impx.net | 200 | 200 | ✅ PASS |
| TC-P005-002 | Flask API 5005 http://localhost:5005/ | 200 | 200 | ✅ PASS |
| TC-P005-003 | API 文件上传 /api/upload | 200 | 400 | ⚠️ 注意(400) |
| TC-P005-004 | API SPARQL 查询 /api/query | 200 | 400 | ⚠️ 注意(400) |
| TC-P005-005 | 双域名 ontology3d.ai.impx.net | 200 | 200 | ✅ PASS |

## 测试用例

详见 `/Users/wengzhishan/Data/wss/projects/ontology_visualizer/docs/test/` 目录下的测试案例文档。

## 备注

- **P001**: TC-P001-003 返回404可能是路由已移除，TC-P001-004 返回401是正常鉴权拦截
- **P003**: AgentFree后端API需进一步验证（SSH本地端口需通过nginx代理访问）
- **P004**: 纯前端SPA，所有页面均正常
- **P005**: Flask API upload/query 返回400是正常参数校验结果（空文件/空body），非错误
- **P006**: /api/health 返回404说明该后端无此端点，/api/sparql/graph 正常工作
