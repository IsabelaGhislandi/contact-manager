import { app } from './app'
import { env } from './env'
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Contact Manager API",
        version: "1.0.0",
        description: "",
      },
    },
    apis: ["./src/routes/*.ts"],
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${env.PORT}!`)
})
