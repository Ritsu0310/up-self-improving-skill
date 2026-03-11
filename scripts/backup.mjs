#!/usr/bin/env node
/**
 * Memory Guardian: 立即备份到 GitHub
 * 
 * 使用: node backup.mjs
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

console.log('🔄 Memory Guardian 备份中...');

try {
  // 检查 git 状态
  const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
  
  if (!status.trim()) {
    console.log('ℹ️  没有变更需要备份');
    process.exit(0);
  }
  
  // 添加所有变更
  execSync('git add .', { cwd: ROOT, stdio: 'pipe' });
  
  // 提交
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  execSync(`git commit -m "Backup: ${timestamp}"`, { cwd: ROOT, stdio: 'pipe' });
  
  // 推送
  execSync('git push origin main', { cwd: ROOT, stdio: 'pipe' });
  
  console.log(`✅ 备份完成: ${timestamp}`);
  console.log('   推送至: https://github.com/Ritsu0310/up-self-improving-skill');
  
} catch (e) {
  console.error('❌ 备份失败:', e.message);
  process.exit(1);
}
