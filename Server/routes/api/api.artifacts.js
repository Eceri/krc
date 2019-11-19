import express from "express";
import Logger from "../../Config/logger";

import Data from "../../model/model.artifacts";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const childLogger = Logger.child({ requestId: "451" });
  childLogger.info("GET Route /");
  try {
    const result = await Data.find();
    res.status(200).send(result);
    childLogger.info(`Found ${Object.keys(result).length} entries`);
  } catch (error) {
    next(error);
  }
  childLogger.info("End GET Route /");
});

// Post an array of Artifacts to DB
router.post("/post", async (req, res, next) => {
  const body = req.body;
  Logger.info("POST Route /artifact/post");
  try {
    await body.map(async v => {
      Data.create({ ...v }, error => {
        if (error) {
          Logger.error(error);
          res.status(400).send(error);
        }
      });
    });
    Logger.info(`DB got ${body.length} new entry`);
    res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
  Logger.info("End POST Route /artifact/post");
});

// Get one Artifact by ID
router.get("/:id", async (req, res, next) => {
  Logger.info("GET Route /artifact/id");
  try {
    const id = req.params.id;
    await Data.findById(id, (error, artifact) => {
      if (error) {
        Logger.error(error);
        res.status(400).send(`No Artifact found with ${id} as an id`);
      }
      res.status(200).send(artifact);
    });
  } catch (error) {
    next(error);
  }
  Logger.info("End GET Route /artifact/id");
});

// Get one Artifact by Name
router.get("/:name", async (req, res, next) => {
  Logger.info("GET Route /artifact/:name");
  try {
    const name = req.params.name;
    await Data.findOne({ name: name }, (error, artifact) => {
      if (error) {
        Logger.error(error);
        res
          .status(400)
          .send(`No Artifact named ${name} exists in our Database`);
      }
      res.status(200).send(artifact);
    });
  } catch (error) {
    next(error);
  }
  Logger.info("End GET Route /artifact/id");
});

// Update one Artifact with id as identifier
router.put("/update/:id", async (req, res, next) => {
  Logger.info("UPDATE Route /artifact/update/:id");
  const id = req.params.id;
  const body = req.body;
  try {
    const compareData = await Data.findById(id, (error, data) => {
      if (error) {
        Logger.error(error);
        res.status(400).send(`No Artifact found with ${id} as an id`);
      }
      return data;
    });
    await Data.updateOne(
      { _id: id },
      {
        $set: {
          name: body.name ? body.name : compareData.name,
          description: body.description
            ? body.description
            : compareData.description,
          story: body.story ? body.story : compareData.story
        }
      }
    );
  } catch (error) {
    next(error);
  }
  res.status(200).send(`Updated ${id} with ${JSON.stringify(body)}`);
  Logger.info("End UPDATE Route /artifact/update/:id", id);
});

// Delete one Artifact with id as identifier
router.delete("/delete/:id", async (req, res, next) => {
  Logger.info("DELETE Route /artifact/delete/:id");
  const id = req.params.id;
  try {
    await Data.deleteOne({ _id: id }, error => {
      if (error) {
        Logger.error(error);
        res.status(400).send(`No Artifact found with ${id} as an id`);
      }
      res.status(200).send(`Deleted ${id}`);
    });
  } catch (error) {
    next(error);
  }
  Logger.info("End DELETE Route /artifact/delete/:id", id);
});

router.delete("/delete/all", async (req, res, next) => {
  Logger.info("DELETE ALL Route /artifact/delete/all");
  try {
    await Data.deleteMany({});
  } catch (error) {
    next(error);
  }
  res.status(200).send(`Deleted all`);
  Logger.info("End DELETE ALL Route /artifact/delete/all");
});

export default router;
