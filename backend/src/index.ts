import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
const httpServer = app.listen(8080, () => {
  console.log("app is running on port 8080");
});

const wss = new WebSocketServer({ server: httpServer });
// eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
const clients = new Set();
wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("error", console.error);

  ws.on("message", (message) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clients.forEach((client: any) => {
      if (client !== ws) {
        client.send(message.toString());
      }
    });
  });
});
