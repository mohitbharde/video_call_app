import express from "express";
import { WebSocketServer } from "ws";
import type { WebSocket as WsWebSocket } from "ws";

const app = express();

app.use(express.json());

const httpServer = app.listen(8080, () => {
  console.log("app is running on port 8080");
});

const wss = new WebSocketServer({ server: httpServer });

const room = new Map<string, WsWebSocket[]>();

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (message) => {
    const { type, roomId, data } = JSON.parse(message.toString());

    if (type == "create") {
      room.set(roomId, [ws]);
      console.log("room when create : ", room.get(roomId)?.length);
      ws.send(
        JSON.stringify({
          type: "created",
          data: "room is created successfully",
          roomId,
        })
      );
    }

    if (type == "join") {
      console.log("inside the join , before join: ", room.get(roomId)?.length);
      room.get(roomId)?.push(ws);
      console.log("room length after  join : ", room.get(roomId)?.length);
      ws.send(
        JSON.stringify({
          type: "joined",
          data: `you are joined to room with id ${roomId}`,
          roomId,
        })
      );

      setTimeout(() => {
        room.get(roomId)?.forEach((ele) => {
          ele.send(
            JSON.stringify({
              type: "ready",
              data: "ready to connect ",
              roomId: roomId,
            })
          );
        });
      }, 2000);
    }

    if (type == "offer") {
      const offerSender = room.get(roomId);
      console.log(
        "offerSender: ",
        typeof offerSender,
        "and length of offersender is: ",
        offerSender?.length
      );
      if (offerSender) {
        offerSender[1].send(
          JSON.stringify({
            type: "offer",
            data,
            roomId: roomId,
          })
        );
      }
    }

    if (type == "answer") {
      const answerSender = room.get(roomId);
      if (answerSender) {
        answerSender[0].send(
          JSON.stringify({
            type: "answer",
            data,
            roomId: roomId,
          })
        );
      }
    }

    if (type == "candidate") {
      // console.log(JSON.parse(message.toString()));
      room.get(roomId)?.forEach((ele) => {
        if (ele !== ws) {
          ele.send(
            JSON.stringify({
              type: "candidate",
              data: data,
              roomId: roomId,
            })
          );
        }
      });
    }

    if (type == "end") {
      room.get(roomId)?.forEach((ele) => {
        ele.send(
          JSON.stringify({
            type: "end",
            data: "end the call",
          })
        );
      });
      room.delete(roomId);
    }
  });
});
