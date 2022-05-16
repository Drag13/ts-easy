const express = require("express");

function run() {
  const port = 4000;
  const app = express();

  app.use(express.json());

  app.post("/user", (req: any, res: any) => {
    console.log(req.body);
    res.send(
      JSON.stringify({ name: "Jhon", secondName: "Dhou", id: req.body.id })
    );
  });

  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });
}

run();
