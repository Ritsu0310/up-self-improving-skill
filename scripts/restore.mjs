#!/usr/bin/env node
/**
 * Memory Guardian: /new 或压缩后恢复记忆
 * 
 * 使用: node restore.mjs
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RECORDS_DIR = join(ROOT, 'records');

console.log('🔄 Memory Guardian 恢复中...');

try {
  // 1. 从 GitHub 拉取最新
  console.log('📥 从 GitHub 拉取...');
  execSync('git pull origin main', { cwd: ROOT, stdio: 'pipe' });
  
  // 2. 读取最近记录
  const rawDir = join(RECORDS_DIR, 'raw');
  if (!existsSync(rawDir)) {
    console.log('ℹ️  没有记录');
    process.exit(0);
  }
  
  const files = readdirSync(rawDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, 5);
  
  if (files.length === 0) {
    console.log('ℹ️  没有记录');
    process.exit(0);
  }
  
  console.log(`\n📋 最近 ${files.length} 条记录:`);
  console.log('='.repeat(60));
  
  files.forEach((file, i) => {
    const content = readFileSync(join(rawDir, file), 'utf8');
    const timeMatch = content.match(/\*\*时间\*\*: (.+)/);
    const reasonMatch = content.match(/\*\*原因\*\*: (.+)/);
    
    console.log(`\n[${i + 1}] ${file}`);
    console.log(`    时间: ${timeMatch?.[1] || '未知'}`);
    console.log(`    原因: ${reasonMatch?.[1] || '未知'}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 恢复完成');
  
} catch (e) {
  console.error('❌ 恢复失败:', e.message);
  process.exit(1);
}
