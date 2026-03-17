import { Server } from "socket.io";
import { ENV } from "../config/env.js";

// ? Every user → constantly shares location
// ? Server → keeps a live map of users
// ? Incident → acts like a "ping"
// ? Server → checks who is close
// ? Only those users → receive alert

let io;
const socketLocations = new Map();

const toRadians = (deg) => (deg * Math.PI) / 180;

const isValidCoordinate = (lat, lng) => {
  const isValidLat =
    typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90;
  const isValidLng =
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180;

  return isValidLat && isValidLng;
};

// ? Haversine Formula : it calcualtes real-world distance between two points on earth
const distanceMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ENV.client_url || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("user-location-update", (payload) => {
      const { lat, lng } = payload || {};

      if (!isValidCoordinate(lat, lng)) {
        return;
      }

      const userId = socket.user?.id || socket.user?._id || null;
      socketLocations.set(socket.id, { lat, lng, userId });
    });

    socket.on("disconnect", () => {
      socketLocations.delete(socket.id);
    });
  });

  return io;
};

export const emitIncidentNearby = (incident, radiusMeters = 5000) => {
  const socketServer = getIO();
  const coords = incident?.location?.coordinates;

  if (!Array.isArray(coords) || coords.length < 2) {
    return;
  }

  const incidentLng = coords[0];
  const incidentLat = coords[1];

  if (!isValidCoordinate(incidentLat, incidentLng)) {
    return;
  }

  for (const [socketId, location] of socketLocations.entries()) {
    const { lat, lng } = location;

    if (!isValidCoordinate(lat, lng)) {
      continue;
    }

    const distance = distanceMeters(incidentLat, incidentLng, lat, lng);

    if (distance <= radiusMeters) {
      socketServer.to(socketId).emit("incident-created", incident);
    }
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};
