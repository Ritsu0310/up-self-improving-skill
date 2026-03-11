#!/usr/bin/env node
/**
 * Memory Guardian: 记录当前对话
 * 
 * 保存原始对话 + 总结 + 立即备份
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RECORDS_DIR = join(ROOT, 'records');

// 确保目录存在
['raw', 'summary', 'self-improving'].forEach(dir => {
  const path = join(RECORDS_DIR, dir);
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
});

// 时间戳
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().slice(0, 5);

const reason = process.argv[2] || 'manual';

console.log(`📝 Memory Guardian 记录: ${timestamp}`);
console.log(`   原因: ${reason}`);

// 创建原始记录
const rawContent = `# 原始对话记录

**时间**: ${dateStr} ${timeStr}
**原因**: ${reason}
**Skill**: Memory Guardian

## 对话内容

[从会话 JSONL 提取或手动记录]

## 关键交互

- 用户指令
- 我的回应
- 思维转变

## 环境信息

- 模型: [当前模型]
- 上下文: [使用率]
- 会话 ID: [会话 ID]
`;

// 创建总结
const summaryContent = `# 对话总结

**时间**: ${dateStr} ${timeStr}
**原因**: ${reason}

## 核心要点

[待填写]

## 学到的内容

[待填写]

## 待办事项

[待填写]
`;

// 保存文件
const rawFile = join(RECORDS_DIR, 'raw', `${timestamp}-对话.md`);
const summaryFile = join(RECORDS_DIR, 'summary', `${timestamp}-总结.md`);

writeFileSync(rawFile, rawContent);
writeFileSync(summaryFile, summaryContent);

console.log(`✅ 原始记录: ${rawFile}`);
console.log(`✅ 总结记录: ${summaryFile}`);

// 更新索引
const indexFile = join(RECORDS_DIR, 'index.md');
let indexContent = existsSync(indexFile) 
  ? readFileSync(indexFile, 'utf8') 
  : '# Memory Guardian 索引\n\n| 时间 | 原因 | 原始 | 总结 |\n|------|------|------|------|\n';

indexContent += `| ${timestamp} | ${reason} | [查看](raw/${timestamp}-对话.md) | [查看](summary/${timestamp}-总结.md) |\n`;
writeFileSync(indexFile, indexContent);

console.log(`✅ 索引更新`);

// 立即备份
console.log('🔄 立即备份...');
try {
  const backupScript = join(__dirname, 'backup.mjs');
  execSync(`node "${backupScript}"`, { stdio: 'inherit', timeout: 30000 });
  console.log('✅ 备份完成');
} catch (e) {
  console.error('❌ 备份失败:', e.message);
}

console.log('✅ Memory Guardian 记录完成');
