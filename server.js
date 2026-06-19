import "dotenv/config";

import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { bookAppointment } from "./tools/bookAppointment.js";
import { getDoctors } from "./tools/getDoctors.js";
import { getSlots } from "./tools/getSlots.js";

function createMcpServer() {
  const server = new Server(
    {
      name: "healthcare-mcp",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async () => ({
      tools: [
        {
          name: "get_doctors",
          description: "Retrieve doctors by specialty",
          inputSchema: {
            type: "object",
            properties: {
              specialty: {
                type: "string",
                description: "Medical specialty, such as Cardiology or Dermatology"
              }
            },
            required: ["specialty"]
          }
        },
        {
          name: "get_slots",
          description: "Retrieve available appointment slots",
          inputSchema: {
            type: "object",
            properties: {
              start_datetime: {
                type: "string",
                description: "Start datetime in ISO format"
              },
              end_datetime: {
                type: "string",
                description: "End datetime in ISO format"
              }
            },
            required: ["start_datetime", "end_datetime"]
          }
        },
        {
          name: "book_appointment",
          description: "Book a healthcare appointment",
          inputSchema: {
            type: "object",
            properties: {
              specialty: {
                type: "string"
              },
              doctor_name: {
                type: "string"
              },
              selected_time_slot: {
                type: "string",
                description: "Selected appointment start time in ISO format"
              }
            },
            required: ["specialty", "doctor_name", "selected_time_slot"]
          }
        }
      ]
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      const { name, arguments: args = {} } = request.params;

      console.error(`Tool invoked: ${name}`);
      console.error("Arguments:", args);

      switch (name) {
        case "get_doctors":
          return getDoctors(args);

        case "get_slots":
          return getSlots(args);

        case "book_appointment":
          return bookAppointment(args);

        default:
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  status: "error",
                  message: `Unknown tool: ${name}`
                })
              }
            ],
            isError: true
          };
      }
    }
  );

  return server;
}

async function handleMcpRequest(req, res) {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("MCP request failed");
    console.error(error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null
      });
    }

    await transport.close();
    await server.close();
  }
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      name: "Healthcare MCP Server",
      status: "running",
      endpoint: "/mcp"
    });
  });

  app.post("/mcp", handleMcpRequest);

  app.get("/mcp", (req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed"
      },
      id: null
    });
  });

  app.delete("/mcp", (req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed"
      },
      id: null
    });
  });

  app.listen(port, () => {
    console.error("=================================");
    console.error(`Healthcare MCP Server running on port ${port}`);
    console.error(`MCP endpoint: http://localhost:${port}/mcp`);
    console.error("=================================");
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION");
  console.error(reason);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error("Failed to start MCP server");
  console.error(error);
  process.exit(1);
});
