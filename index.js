const express = require('express');
const app = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db');

app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/notes', async(req, res, next)=> {
  try {
    const SQL = `
      SELECT *
      FROM notes
      ORDER BY ranking DESC
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/notes/:id', async(req, res, next)=> {
  try {
    const SQL = `
      SELECT *
      FROM notes
      WHERE id = $1
    `;
    const response = await client.query(SQL, [ req.params.id ]);
    res.send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/notes/:id', async(req, res, next)=> {
  try {
    const SQL = `
      DELETE FROM notes
      WHERE id = $1
    `;
    await client.query(SQL, [ req.params.id ]);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/notes', async(req, res, next)=> {
  try {
    const SQL = `
      INSERT INTO notes(txt, ranking) VALUES($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [ req.body.txt, req.body.ranking]);
    res.status(201).send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});

app.put('/api/notes/:id', async(req, res, next)=> {
  try {
    const SQL = `
      UPDATE notes
      SET txt = $1, ranking = $2, updated_at = now()
      WHERE id = $3
      RETURNING *
    `;
    const response = await client.query(SQL, [ req.body.txt, req.body.ranking, req.params.id]);
    res.status(201).send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});


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
  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();
