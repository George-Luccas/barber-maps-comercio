import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Cria os métodos GET e POST que o UploadThing precisa
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});