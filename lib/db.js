import pkg from "pg";
const { Pool } = pkg;

class DatabasePool {
  static pool = null;

  static initialize() {
    if (this.pool) {
      return this.pool;
    }

    this.pool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_URL,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: process.env.POSTGRES_PORT,
      max: 10,                    // Maximum pool size aligned with Redis
      min: 2,                     // Minimum pool size
      idleTimeoutMillis: 30000,   // How long a connection can be idle
      connectionTimeoutMillis: 5000, // Connection timeout
      statement_timeout: 30000,    // Statement timeout
      query_timeout: 30000,        // Query timeout
      maxUses: 7500,              // Connection recycling
    });

    // Error handling
    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      if (client) {
        client.release(true); // Release with error
      }
    });

    // Connection monitoring
    this.pool.on('connect', (client) => {
      console.log('New database connection established');
      client.query('SET statement_timeout = 30000'); // 30 seconds
    });

    this.pool.on('acquire', () => {
      console.log('Client acquired from pool');
    });

    this.pool.on('remove', () => {
      console.log('Client removed from pool');
    });

    return this.pool;
  }

  static async getConnection() {
    if (!this.pool) {
      this.initialize();
    }
    return await this.pool.connect();
  }

  static async query(text, params) {
    const client = await this.getConnection();
    try {
      const start = Date.now();
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      console.error('Query error', err.message, { text, params });
      throw err;
    } finally {
      client.release();
    }
  }

  static async end() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database pool has been closed');
    }
  }
}

// Initialize the pool
DatabasePool.initialize();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await DatabasePool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await DatabasePool.end();
  process.exit(0);
});

export default DatabasePool;
