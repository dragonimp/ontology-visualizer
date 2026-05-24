# P005 — Ontology Visualizer 项目描述

> 知识图谱/本体可视化 | ontology.ai.impx.net（待部署）
> 最后更新：2026-05-24

## 基本信息

| 项 | 值 |
|----|-----|
| **项目编号** | P005 |
| **项目名称** | Ontology Visualizer |
| **状态** | 🟢 进行中 |
| **负责人** | wss |
| **AI 助手** | hermes-coding（小马） |
| **开始日期** | 2026-05-24 |
| **本地源码** | `~/Data/wss/projects/ontology_visualizer/ontology3d_new/` |
| **文档路径** | `~/Data/wss/projects/ontology_visualizer/docs/` |
| **Git 仓库** | https://github.com/dragonimp/ontology-visualizer |
| **Git 分支** | main |
| **企业微信群聊ID** | （待确认） |

## 项目描述

知识图谱/本体可视化平台，支持 TTL/RDF/OWL 文件上传、力导向图渲染、SPARQL 查询和 3D 可视化。

## 技术栈

- **前端**：React 18 + Vite + Three.js + RDF/OWL 解析库
- **数据格式**：TTL (Turtle), RDF, OWL

## 部署信息

### 服务器

| 项 | 值 |
|----|-----|
|| **部署服务器** | zz.impx.net |
|| **项目根目录** | /opt/ontology/ |
|| **web 目录** | /opt/ontology/web/（Nginx serve 静态文件） |
|| **api 目录** | /opt/ontology/api/ |
|| **data 目录** | /opt/ontology/data/ |
|| **备份目录** | /opt/backups/ontology/ |
| **HTTPS** | ✅ 通配证书 (impx.net) — `/etc/letsencrypt/live/impx.net/` |

### 域名

| 项 | 值 |
|----|-----|
| **域名** | https://ontology.ai.impx.net/ |

## 核心功能

1. TTL/RDF/OWL 文件上传与解析
2. 力导向图渲染
3. SPARQL 查询
4. 3D 可视化
5. 与 P006 BigData Agent 集成（iframe 嵌入）
