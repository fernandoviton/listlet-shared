// Pure .env text manipulation, kept free of fs / dotenv / Supabase so it can
// be unit tested. File IO lives in supabase-cli.js.

// Upsert a single KEY=value line, preserving the rest of the contents.
function upsertEnvLine(contents, key, value) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(contents)) {
        return contents.replace(re, line);
    }
    let out = contents;
    if (out.length && !out.endsWith('\n')) out += '\n';
    return out + line + '\n';
}

module.exports = { upsertEnvLine };
