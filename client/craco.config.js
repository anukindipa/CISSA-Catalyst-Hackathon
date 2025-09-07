module.exports = {
  devServer: {
    allowedHosts: "all",
    host: "localhost",
    port: 3000,
    client: {
      webSocketURL: "ws://localhost:3000/ws",
    },
  },
};
