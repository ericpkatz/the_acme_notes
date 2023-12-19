const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db');


const init = async()=> {
  await client.connect();
  console.log('connected to database');
  let SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
      id SERIAL PRIMARY KEY,
      txt VARCHAR(255) NOT NULL,
      ranking INTEGER NOT NULL DEFAULT 5,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
  `;
  await client.query(SQL);
  console.log('tables created');
  SQL = `
    INSERT INTO notes(txt, ranking) VALUES('hello', 3);
    INSERT INTO notes(txt) VALUES('world');
  `;
  await client.query(SQL);
  console.log('data seeded');
};

init();
