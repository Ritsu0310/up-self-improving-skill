#!/usr/bin/env node
/**
 * Memory Guardian: 检查上下文使用率
 * 
 * 每 10 分钟运行一次，≥70% 自动触发记录
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THRESHOLD = 70;

console.log('🛡️ Memory Guardian 检查中...');

try {
  // 获取上下文使用率
  const output = execSync('openclaw status --json 2>/dev/null || echo "{}"', { 
    encoding: 'utf8',
    timeout: 5000
  });
  
  const status = JSON.parse(output);
  const session = status.sessions?.find(s => s.kind === 'direct') || status.sessions?.[0];
  
  if (!session) {
    console.log('ℹ️ 无活跃会话');
    process.exit(0);
  }
  
  // 解析 tokens (格式: "usage/max")
  const tokens = session.tokens || {};
  const usage = tokens.usage || 0;
  const max = tokens.max || 100;
  const percentage = Math.round((usage / max) * 100);
  
  console.log(`   上下文: ${usage}/${max} (${percentage}%)`);
  
  if (percentage >= THRESHOLD) {
    console.log(`⚠️  超过阈值 ${THRESHOLD}%，触发记录...`);
    
    const recordScript = join(__dirname, 'record.mjs');
    execSync(`node "${recordScript}" "上下文使用率 ${percentage}%"`, { 
      stdio: 'inherit',
      timeout: 30000
    });
    
    console.log('✅ 记录完成');
  } else {
    console.log(`✓ 正常 (${percentage}% < ${THRESHOLD}%)`);
  }
  
} catch (e) {
  console.error('❌ 检查失败:', e.message);
  // 失败不退出，避免 cron 报错
  process.exit(0);
}
