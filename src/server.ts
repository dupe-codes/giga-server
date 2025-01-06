import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Router, Response, Request } from "express";
import path from "path";

import { readFileSync, writeFileSync, readdirSync } from "fs";
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
    const config = load(readFileSync(default_config, "utf8")) as Config;
    config.drawings_dir = expand_env_vars(config.drawings_dir);
    return config;
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

function get_saved_drawings(config: Config): Array<string> {
  const files = readdirSync(config.drawings_dir);
  return files.map((file) => file.replace(config.saved_drawings_ext, ""));
}

const saved_drawings = get_saved_drawings(config_data);

interface DrawingData {
  document: JSON;
  session: JSON;
}

interface DrawingPOSTRequest {
  name: string;
  drawing: DrawingData;
}

interface GetAllDrawingsResponse {
  drawings: Array<string>;
}

interface GetDrawingResponse {
  name: string;
  drawing: DrawingData;
}

router.post("/drawing", (req: Request, res: Response) => {
  const payload = req.body as DrawingPOSTRequest;
  const save_file = path.join(
    config_data.drawings_dir,
    payload["name"] + config_data.saved_drawings_ext,
  );
  console.log(`Saving drawing to ${save_file}`);
  writeFileSync(save_file, JSON.stringify(payload["drawing"]));
  res.status(200).json({ message: "looks good!" });
});

router.get("/drawing/:file_name", (req: Request, res: Response) => {
  const file_name = req.params["file_name"];

  if (!saved_drawings.includes(file_name)) {
    res.status(404).json({ message: "That file doesn't exist!" });
    return;
  }

  const saved_file = path.join(
    config_data.drawings_dir,
    file_name + config_data.saved_drawings_ext,
  );

  const file_data = readFileSync(saved_file, "utf8");
  const json_response = {
    name: file_name,
    drawing: JSON.parse(file_data) as DrawingData,
  } as GetDrawingResponse;

  res.status(200).json(json_response);
});

router.get("/drawing", (_: Request, res: Response) => {
  const json_response = {
    drawings: saved_drawings,
  } as GetAllDrawingsResponse;
  res.status(200).json(json_response);
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
