const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'node_modules', '@copilotkit', 'runtime', 'dist', 'v2', 'runtime', 'endpoints', 'node-fetch-handler.cjs');

if (fs.existsSync(targetPath)) {
  let content = fs.readFileSync(targetPath, 'utf8');
  
  if (content.includes('require("@remix-run/node-fetch-server")')) {
    content = content.replace(
      'let _remix_run_node_fetch_server = require("@remix-run/node-fetch-server");',
      'let _remix_run_node_fetch_server = null;'
    );
    
    content = content.replace(
      'return async (req, res) => {',
      'return async (req, res) => {\n\t\tif (!_remix_run_node_fetch_server) _remix_run_node_fetch_server = await import("@remix-run/node-fetch-server");'
    );
    
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('✅ Patched @copilotkit/runtime node-fetch-handler.cjs');
  } else {
    console.log('ℹ️ CopilotKit node-fetch-handler already patched or different version.');
  }
} else {
  console.log('⚠️ Could not find @copilotkit/runtime node-fetch-handler.cjs to patch.');
}
