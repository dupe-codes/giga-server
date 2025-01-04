import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Router, Response, Request } from "express";
import path from "path";

import { readFileSync, writeFileSync } from "fs";
import { load } from "js-yaml";

// TODO: set up logging to log dir and file

interface Config {
  drawings_dir: string;
  saved_drawings_ext: string;
}

export function expand_env_vars(str: string): string {
  return str.replace(/\$([A-Z_]+)/g, (match: string, envVarName: string) => {
    return process.env[envVarName] || match;
  });
}

function read_config_file(): Config {
  const config_file_path = `${process.env.HOME}/.config/giga-server/config.yml`;
  try {
    return load(readFileSync(config_file_path, "utf8")) as Config;
  } catch (error) {
    console.error(`Failed to load config file at ${config_file_path}`, error);
    console.warn("Using default configuration");
    const default_config = path.join(__dirname, "config.yml");
    return load(readFileSync(default_config, "utf8")) as Config;
  }
}

const config_data = read_config_file();
console.log(config_data);

const server: Express = express();
const PORT: string | number = process.env.PORT || 4000;

server.use(cors());
server.use(bodyParser.json());
server.use(express.static(path.join(__dirname, "../client")));

const router: Router = Router();

/*
 * Drawing routes
 */

interface DrawingPOSTRequest {
  name: string;
  drawing: JSON;
}

router.post("/drawing", (req: Request, res: Response) => {
  const payload = req.body as DrawingPOSTRequest;
  const save_file = path.join(
    expand_env_vars(config_data.drawings_dir),
    payload["name"] + config_data.saved_drawings_ext,
  );
  console.log(`Saving drawing to ${save_file}`);
  writeFileSync(save_file, JSON.stringify(payload["drawing"]));
  res.status(200).json({ message: "looks good!" });
});

/*
 * Catch all route to serve client application
 */
router.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

server.use(router);

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
