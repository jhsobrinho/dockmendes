import fs from 'fs';
import path from 'path';

const controllersDir = './controllers';

// Lista todos os arquivos no diretório controllers
const files = fs.readdirSync(controllersDir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substitui a importação
    content = content.replace(
      "import db from '../models/index.js';",
      "import db from '../models/db.js';"
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Atualizado: ${file}`);
  }
});
