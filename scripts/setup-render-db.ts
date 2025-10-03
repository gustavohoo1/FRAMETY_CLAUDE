import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema.js';
import { users } from '../shared/schema.js';
import crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function setupDatabase() {
  const databaseUrl = process.argv[2];
  
  if (!databaseUrl) {
    console.error('❌ Por favor, forneça a DATABASE_URL do Render como argumento');
    console.log('\nUso: npm run setup:render "postgresql://..."');
    process.exit(1);
  }

  console.log('🔄 Conectando ao banco de dados do Render...');
  
  const pool = new Pool({ 
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const db = drizzle(pool, { schema });
    
    console.log('✅ Conectado! Verificando usuários...');
    
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log(`✅ Banco já configurado! Encontrados ${existingUsers.length} usuário(s):`);
      existingUsers.forEach(u => {
        console.log(`   - ${u.nome} (${u.email}) - ${u.papel}`);
      });
    } else {
      console.log('📝 Banco vazio! Criando usuário admin padrão...');
      
      await db.insert(users).values({
        nome: 'Admin',
        email: 'admin@framety.com',
        password: hashPassword('admin123'),
        papel: 'Admin',
        ativo: true
      });
      
      console.log('✅ Usuário admin criado!');
      console.log('   Email: admin@framety.com');
      console.log('   Senha: admin123');
      console.log('\n⚠️  IMPORTANTE: Altere esta senha após o primeiro login!');
    }
    
    console.log('\n🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
