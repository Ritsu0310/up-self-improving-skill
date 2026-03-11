#!/usr/bin/env node
/**
 * Memory Guardian: 显示记忆状态
 * 
 * 使用: node status.mjs
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RECORDS_DIR = join(ROOT, 'records');

console.log('🛡️ Memory Guardian 状态\n');

// 统计记录
const stats = { raw: 0, summary: 0, total: 0 };

['raw', 'summary'].forEach(type => {
  const dir = join(RECORDS_DIR, type);
  if (existsSync(dir)) {
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    stats[type] = files.length;
    stats.total += files.length;
  }
});

console.log('📊 记录统计:');
console.log(`   原始记录: ${stats.raw}`);
console.log(`   总结记录: ${stats.summary}`);
console.log(`   总计: ${stats.total}`);

// 最近记录
const rawDir = join(RECORDS_DIR, 'raw');
if (existsSync(rawDir) && stats.raw > 0) {
  const files = readdirSync(rawDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, 3);
  
  console.log('\n📝 最近记录:');
  files.forEach(file => {
    const stat = statSync(join(rawDir, file));
    console.log(`   ${file} (${Math.round(stat.size / 1024)}KB)`);
  });
}

// Git 状态
console.log('\n🔄 Git 状态:');
try {
  const { execSync } = await import('child_process');
  const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
  if (status.trim()) {
    console.log('   有未提交的变更');
    console.log(status.split('\n').slice(0, 5).map(l => '   ' + l).join('\n'));
  } else {
    console.log('   已同步');
  }
  
  const log = execSync('git log --oneline -3', { cwd: ROOT, encoding: 'utf8' });
  console.log('\n📜 最近提交:');
  log.split('\n').filter(Boolean).forEach(line => {
    console.log(`   ${line}`);
  });
} catch (e) {
  console.log('   无法获取 Git 状态');
}

console.log('\n✅ 状态检查完成');
