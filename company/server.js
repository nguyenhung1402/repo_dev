import app from "./app.js";

const PORT = process.env.PORT || 8802;

const server = app.listen(PORT, () => {
  console.log(`Dev Server test running on port: ${PORT}`);
  console.log(`jenkins k8s`);

});

export default server;
