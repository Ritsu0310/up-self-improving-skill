---
name: memory-guardian
description: 记忆守护者 - 自主记录、主动备份、压缩/new后恢复。独立 Skill，不依赖系统机制，与 Self-Improving 互补。
metadata:
  openclaw:
    emoji: 🛡️
    requires:
      bins:
        - node
        - git
      env:
        - GITHUB_TOKEN
    primaryEnv: GITHUB_TOKEN
---

# Memory Guardian（记忆守护者）

**核心目标**：守护记忆完整性，防止压缩/new导致失忆。

**独立性**：
- 独立 Skill，不影响 Self-Improving
- 自主控制，不依赖系统定时任务
- 互补协作，Self-Improving 记规则，Memory Guardian 记对话

## 为什么需要

| 场景 | 问题 | Memory Guardian 解决 |
|------|------|----------------------|
| 压缩 | 丢失上下文 | ≥70% 自动记录 |
| /new | 完全失忆 | 启动时主动恢复 |
| 定时备份 | 被动等待 | 立即备份 |
| 系统任务 | 依赖系统 | 自主控制 |

## 核心机制

### 1. 三层记忆

```
records/
├── raw/              # 原始对话（完整、带时间戳）
│   └── 2026-03-11-1312-对话.md
├── summary/          # 总结（核心要点）
│   └── 2026-03-11-1312-总结.md
└── self-improving/   # 给 Self-Improving 的输入
    └── corrections-input.md
```

### 2. 触发机制（主动）

| 触发条件 | 动作 |
|----------|------|
| 上下文 ≥ 70% | 自动记录 + 立即备份 |
| 用户说"记录" | 手动触发记录 |
| /new 或压缩后 | 启动时恢复 |
| 完成重要工作 | 自我反思后记录 |

### 3. 备份机制（立即）

**不等待定时任务**：
```
记录完成 → 立即推送到 GitHub → 验证成功 → 更新索引
```

### 4. 恢复机制（自动）

```
/new 后启动 → 从 GitHub 拉取 → 读取最近 3-5 条 → 恢复上下文
```

## 使用方式

### 方式一：自动（推荐）

**配置心跳检测**（每 10 分钟）：
```bash
openclaw cron add --name "memory-guardian-check" \
  --every "10m" \
  --agent main \
  --message "检查上下文，必要时记录" \
  --session isolated
```

**配置 /new 后恢复**：
在 SOUL.md 中添加：
```markdown
## Memory Guardian 恢复
/new 或压缩后：
1. 执行 `node ~/.openclaw/workspace/skills/memory-guardian/scripts/restore.mjs`
2. 读取最近记录恢复上下文
```

### 方式二：手动

```bash
# 立即记录
node scripts/record.mjs "重要对话"

# 查看状态
node scripts/status.mjs

# 手动恢复
node scripts/restore.mjs
```

## 与 Self-Improving 的关系

| | Self-Improving | Memory Guardian |
|--|----------------|-----------------|
| 职责 | 执行改进 | 记忆守护 |
| 内容 | 规则、偏好、模式 | 原始对话、总结 |
| 触发 | 纠正后 | 压缩前/new后 |
| 备份 | 每天 03:00 | 立即 |
| 恢复 | 无 | 主动恢复 |
| 位置 | `~/self-improving/` | `records/` |

**协作流程**：
1. 对话发生 → Memory Guardian 记录完整过程
2. 用户纠正 → Self-Improving 记录规则
3. Memory Guardian 备份原始对话到 GitHub
4. Self-Improving 备份规则到 GitHub
5. /new 后 → Memory Guardian 恢复上下文 → Self-Improving 应用规则

## 核心脚本

| 脚本 | 功能 | 调用方式 |
|------|------|----------|
| `record.mjs` | 记录当前对话 | 手动/自动 |
| `backup.mjs` | 推送到 GitHub | record 后自动 |
| `restore.mjs` | /new 后恢复 | /new 后自动 |
| `check.mjs` | 检测上下文使用率 | cron 每 10 分钟 |
| `status.mjs` | 显示记忆状态 | 手动 |

## 安装

```bash
# 1. 确保目录存在
mkdir -p ~/.openclaw/workspace/skills/memory-guardian

# 2. 配置 GitHub Token（~/.openclaw/openclaw.json）
{
  "skills": {
    "entries": {
      "memory-guardian": {
        "enabled": true,
        "env": {
          "GITHUB_TOKEN": "ghp_xxxxxxxx"
        }
      }
    }
  }
}

# 3. 重启 OpenClaw 加载 Skill
```

## 关键原则

1. **独立**：不影响其他 Skill，特别是 Self-Improving
2. **主动**：自己检测、自己记录、自己备份
3. **立即**：记录后立即备份，不等待
4. **完整**：原始 + 总结，完整保留
5. **恢复**：/new 后主动恢复，不丢失上下文

---

**最后更新**: 2026-03-11 13:12
**版本**: 1.0.0
**作者**: 律
