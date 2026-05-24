# P005 — Ontology Knowledge Graph 项目描述

> 本体知识图谱可视化 | ontology3d.ai.impx.net
> 最后更新：2026-05-22

## 基本信息

| 项 | 值 |
|----|-----|
| **项目编号** | P005 |
| **项目名称** | Ontology Knowledge Graph |
| **状态** | 🟢 进行中 |
| **负责人** | wss（小马儿） |
| **AI 助手** | hermes-coding（小马） |
| **开始日期** | 2026-05-20 |
| **项目路径** | `~/Data/wss/projects/ontology_visualizer/` |
| **文档路径** | `~/Data/wss/projects/ontology_visualizer/docs/` |
| **企业微信群聊ID** | （待确认） |

## 项目描述

RDF/OWL 本体知识图谱可视化平台，支持多格式文件上传、力导向图渲染、SPARQL 查询、节点详情联动。

## 技术栈

- **后端**：Python 3.12 + Flask + RDFLib（gunicorn）
- **前端**：vis.js + Bootstrap 5
- **核心功能**：
  1. 多格式 RDF/OWL 文件上传（.ttl, .rdf, .owl, .n3, .nt, .jsonld）
  2. vis.js 力导向图渲染
  3. SPARQL 查询编辑器
  4. 节点详情联动（入边/出边）
  5. 图统计面板（节点/边/Triples）
  6. 布局切换（层次/力导向/网格）
  7. PNG/JSON 导出
  8. 搜索与类型过滤

## 部署信息

### 服务器

| 项 | 值 |
|----|-----|
| **部署服务器** | zz.impx.net |
| **Flask 源码路径** | /var/www/html/ontology/ontology_visualizer/ |
| **Flask 进程** | gunicorn（bind 127.0.0.1:5005） |
| **静态文件路径** | /var/www/html/ontology3d/ |
| **frm3d 路径** | /var/www/html/ontology3d/frm3d/（已合并） |
| **HTTPS** | ✅ 独立证书 (ontology.ai.impx.net) |

### 域名

| 项 | 值 |
|----|-----|
| **Flask API + 静态服务** | https://ontology.ai.impx.net/ |
| **API 路径** | https://ontology.ai.impx.net/api/ → Flask 5005 |
| **Nginx 配置** | /etc/nginx/conf.d/ontology.ai.impx.net.conf |

## 本地源码

| 项 | 值 |
|----|-----|
| **后端** | `~/Data/wss/projects/ontology_visualizer/src/` |
| **静态前端（剥离后端）** | `~/Data/wss/projects/ontology_visualizer/ontology3d_new/` |
| **Flask 模板前端（带上传）** | `~/Data/wss/projects/ontology_visualizer/src/templates/` |

## 项目群成员

> （待确认：请志山补充群聊中常一起沟通的成员名单）
