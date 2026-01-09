/**
 * Logger Utility
 * Simple logging with timestamps and levels
 */

export function log(level, message) {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const prefix = {
        info: '📋',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        debug: '🔍',
    }[level] || '📋';

    console.log(`[${timestamp}] ${prefix} ${message}`);
}

export function logTable(data) {
    console.table(data);
}

export function logProgress(current, total, label = 'Progress') {
    const percent = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    process.stdout.write(`\r${label}: ${bar} ${percent}% (${current}/${total})`);
    if (current === total) console.log('');
}
