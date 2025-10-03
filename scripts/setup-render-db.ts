import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
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
    console.log('\nUso: tsx scripts/setup-render-db.ts "postgresql://..."');
    process.exit(1);
  }

  console.log('🔄 Conectando ao banco de dados do Render...');
  
  const pool = new Pool({ 
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const db = drizzle(pool, { schema });
    
    console.log('✅ Conectado!');
    console.log('\n📋 Criando estrutura do banco de dados...');
    
    // Criar enums primeiro
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('Admin', 'Gestor', 'Membro');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM (
          'Briefing', 'Roteiro', 'Captação', 'Edição', 'Entrega', 
          'Outros', 'Revisão', 'Aguardando Aprovação', 'Aprovado',
          'Em Pausa', 'Cancelado'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE priority AS ENUM ('Baixa', 'Média', 'Alta');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Enums criados');
    
    // Criar tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        papel user_role NOT NULL DEFAULT 'Membro',
        ativo BOOLEAN NOT NULL DEFAULT true,
        foto_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela users criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tipos_de_video (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL UNIQUE,
        background_color TEXT NOT NULL DEFAULT '#3b82f6',
        text_color TEXT NOT NULL DEFAULT '#ffffff',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela tipos_de_video criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL UNIQUE,
        background_color TEXT NOT NULL DEFAULT '#10b981',
        text_color TEXT NOT NULL DEFAULT '#ffffff',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela tags criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        empresa TEXT,
        email TEXT,
        telefone TEXT,
        background_color TEXT NOT NULL DEFAULT '#3b82f6',
        text_color TEXT NOT NULL DEFAULT '#ffffff',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela clientes criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS empreendimentos (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        nome TEXT NOT NULL,
        descricao TEXT,
        cliente_id VARCHAR NOT NULL REFERENCES clientes(id),
        background_color TEXT NOT NULL DEFAULT '#3b82f6',
        text_color TEXT NOT NULL DEFAULT '#ffffff',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela empreendimentos criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo TEXT NOT NULL,
        descricao TEXT,
        tipo_video_id VARCHAR NOT NULL REFERENCES tipos_de_video(id),
        tags TEXT[] DEFAULT '{}',
        status project_status NOT NULL DEFAULT 'Briefing',
        responsavel_id VARCHAR NOT NULL REFERENCES users(id),
        data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
        data_prevista_entrega TIMESTAMP,
        data_aprovacao TIMESTAMP,
        prioridade priority NOT NULL DEFAULT 'Média',
        cliente_id VARCHAR REFERENCES clientes(id),
        empreendimento_id VARCHAR REFERENCES empreendimentos(id),
        anexos TEXT[] DEFAULT '{}',
        link_youtube TEXT,
        duracao INTEGER,
        formato TEXT,
        captacao BOOLEAN DEFAULT false,
        roteiro BOOLEAN DEFAULT false,
        locucao BOOLEAN DEFAULT false,
        data_interna TIMESTAMP,
        data_meeting TIMESTAMP,
        link_frame_io TEXT,
        caminho TEXT,
        referencias TEXT,
        informacoes_adicionais TEXT
      );
    `);
    console.log('✅ Tabela projetos criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs_de_status (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        projeto_id VARCHAR NOT NULL REFERENCES projetos(id),
        status_anterior project_status,
        status_novo project_status NOT NULL,
        alterado_por_id VARCHAR NOT NULL REFERENCES users(id),
        data_hora TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela logs_de_status criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        projeto_id VARCHAR NOT NULL REFERENCES projetos(id),
        autor_id VARCHAR NOT NULL REFERENCES users(id),
        texto TEXT NOT NULL,
        anexos TEXT[] DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela comentarios criada');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Tabela session criada');
    
    console.log('\n📝 Verificando usuários...');
    
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log(`✅ Encontrados ${existingUsers.length} usuário(s):`);
      existingUsers.forEach(u => {
        console.log(`   - ${u.nome} (${u.email}) - ${u.papel}`);
      });
    } else {
      console.log('📝 Criando usuário admin padrão...');
      
      await db.insert(users).values({
        nome: 'Admin',
        email: 'admin@framety.com',
        password: hashPassword('admin123'),
        papel: 'Admin',
        ativo: true
      });
      
      console.log('✅ Usuário admin criado!');
      console.log('\n   📧 Email: admin@framety.com');
      console.log('   🔑 Senha: admin123');
      console.log('\n   ⚠️  IMPORTANTE: Altere esta senha após o primeiro login!');
    }
    
    console.log('\n🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
