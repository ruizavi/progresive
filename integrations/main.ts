import { ProgresiveFactory } from "@progresive/core";
import { join } from "path";

// import path from "path";

// const __dirname = path.dirname(__filename);

function bootstrap() {
  const app = ProgresiveFactory.create();

  app.setGlobalPrefix("/api");

  app.setBaseDir(join(__dirname, "controller"));

  app.start(4000);
}

bootstrap();
