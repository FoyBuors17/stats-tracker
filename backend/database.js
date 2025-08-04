import { Client } from "pg";

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "P@ssw0rd!",
  database: "Stats",
});

client.connect();

client.query(`select * from player`, (err, res)=>{
    if (!err) {
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end();
})


