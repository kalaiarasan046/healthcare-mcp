// // // import "dotenv/config";
// // // import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// // // import { getDoctorsTool } from "./tools/getDoctors.js";
// // // import { getSlotsTool } from "./tools/getSlots.js";
// // // import { bookAppointmentTool } from "./tools/bookAppointment.js";

// // // const server = new Server(
// // //   {
// // //     name: "healthcare-mcp-server",
// // //     version: "1.0.0"
// // //   },
// // //   {
// // //     capabilities: {
// // //       tools: {}
// // //     }
// // //   }
// // // );

// // // // Register tools
// // // // getDoctorsTool(server);
// // // // getSlotsTool(server);
// // // // bookAppointmentTool(server);

// // // // Start server (stdio transport for MCP)
// // // await server.connect(transport);
// // // console.log("Healthcare MCP Server running...");




// // import "dotenv/config";

// // import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// // import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// // import {
// //   ListToolsRequestSchema,
// //   CallToolRequestSchema
// // } from "@modelcontextprotocol/sdk/types.js";

// // import { tools } from "./tools/index.js";


// // // Create MCP Server
// // const server = new Server(
// //   {
// //     name: "healthcare-mcp-server",
// //     version: "1.0.0"
// //   },
// //   {
// //     capabilities: {
// //       tools: {}
// //     }
// //   }
// // );

// // // ==========================================
// // // TOOL DISCOVERY HANDLER
// // // ==========================================

// // server.setRequestHandler(
// //   ListToolsRequestSchema,
// //   async () => ({
// //     tools: Object.entries(tools).map(
// //       ([name, definition]) => ({
// //         name,
// //         description: definition.description,
// //         inputSchema: definition.inputSchema
// //       })
// //     )
// //   })
// // );


// // // ==========================================
// // // TOOL EXECUTION HANDLER
// // // ==========================================

// // server.setRequestHandler(
// //   CallToolRequestSchema,
// //   async (request) => {

// //     const toolName = request.params.name;

// //     const tool = tools[toolName];

// //     if (!tool) {
// //       throw new Error(
// //         `Unknown tool: ${toolName}`
// //       );
// //     }

// //     try {

// //       const result =
// //         await tool.execute(
// //           request.params.arguments || {}
// //         );

// //       return {
// //         content: [
// //           {
// //             type: "text",
// //             text: JSON.stringify(
// //               result,
// //               null,
// //               2
// //             )
// //           }
// //         ]
// //       };

// //     } catch (error) {

// //       console.error(
// //         `Tool Execution Error (${toolName}):`,
// //         error
// //       );

// //       return {
// //         content: [
// //           {
// //             type: "text",
// //             text: JSON.stringify({
// //               status: "error",
// //               message: error.message
// //             })
// //           }
// //         ],
// //         isError: true
// //       };

// //     }
// //   }
// // );


// // // ==========================================
// // // START MCP SERVER
// // // ==========================================

// // const transport =
// //   new StdioServerTransport();

// // await server.connect(transport);

// // console.error(
// //   "Healthcare MCP Server Started"
// // );



// import "dotenv/config";

// import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// import { getDoctorsTool } from "./tools/getDoctors.js";
// import { getSlotsTool } from "./tools/getSlots.js";
// import { bookAppointmentTool } from "./tools/bookAppointment.js";

// async function startServer() {
//   try {
//     console.error("=================================");
//     console.error("Starting Healthcare MCP Server");
//     console.error("=================================");

//     // Create MCP Server
//     const server = new Server(
//       {
//         name: "healthcare-mcp-server",
//         version: "1.0.0"
//       },
//       {
//         capabilities: {
//           tools: {}
//         }
//       }
//     );

//     console.error("Registering tools...");

//     // Register MCP Tools
//     getDoctorsTool(server);
//     getSlotsTool(server);
//     bookAppointmentTool(server);

//     console.error("✓ get_doctors registered");
//     console.error("✓ get_slots registered");
//     console.error("✓ book_appointment registered");

//     // Create stdio transport
//     const transport = new StdioServerTransport();

//     console.error("Connecting transport...");

//     // Start MCP Server
//     await server.connect(transport);

//     console.error("=================================");
//     console.error("Healthcare MCP Server Running");
//     console.error("=================================");
//   } catch (error) {
//     console.error("Failed to start MCP server");
//     console.error(error);

//     process.exit(1);
//   }
// }

// /*
// |--------------------------------------------------------------------------
// | Global Error Handlers
// |--------------------------------------------------------------------------
// */

// process.on("unhandledRejection", (reason) => {
//   console.error("UNHANDLED PROMISE REJECTION");
//   console.error(reason);
// });

// process.on("uncaughtException", (error) => {
//   console.error("UNCAUGHT EXCEPTION");
//   console.error(error);

//   process.exit(1);
// });

// /*
// |--------------------------------------------------------------------------
// | Start Server
// |--------------------------------------------------------------------------
// */

// startServer();


//---------new code after refactor---------

import "dotenv/config";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { getDoctors } from "./tools/getDoctors.js";
import { getSlots } from "./tools/getSlots.js";
import { bookAppointment } from "./tools/bookAppointment.js";

/*
|--------------------------------------------------------------------------
| MCP Server
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Tool Discovery
|--------------------------------------------------------------------------
*/

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
              description: "Medical specialty (Cardiology, Dermatology, etc.)"
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

          required: [
            "start_datetime",
            "end_datetime"
          ]
        }
      },

      {
        name: "book_appointment",

        description:
          "Book a healthcare appointment",

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
              type: "string"
            }
          },

          required: [
            "specialty",
            "doctor_name",
            "selected_time_slot"
          ]
        }
      }
    ]
  })
);

/*
|--------------------------------------------------------------------------
| Tool Execution
|--------------------------------------------------------------------------
*/

server.setRequestHandler(
  CallToolRequestSchema,
  async (request) => {
    try {

      const { name, arguments: args } = request.params;

      console.error(`Tool Invoked: ${name}`);
      console.error("Arguments:", args);

      switch (name) {

        case "get_doctors":
          return await getDoctors(args);

        case "get_slots":
          return await getSlots(args);

        case "book_appointment":
          return await bookAppointment(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

    } catch (error) {

      console.error("Tool Execution Error");
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: error.message
            })
          }
        ]
      };
    }
  }
);

/*
|--------------------------------------------------------------------------
| Global Error Handling
|--------------------------------------------------------------------------
*/

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION");
  console.error(reason);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(error);
});

/*
|--------------------------------------------------------------------------
| Start MCP Server
|--------------------------------------------------------------------------
*/
// ----MCP STUDIO SERVER

// async function startServer() {

//   try {

//     console.error("=================================");
//     console.error("Starting Healthcare MCP Server");
//     console.error("=================================");

//     const transport = new StdioServerTransport();

//     await server.connect(transport);

//     console.error("=================================");
//     console.error("Healthcare MCP Server Running");
//     console.error("=================================");

//   } catch (error) {

//     console.error("Failed to start MCP Server");
//     console.error(error);

//     process.exit(1);
//   }
// }

// startServer();
//------END OF STUDIO SERVER 


async function startServer() {
  try {
    console.error("=================================");
    console.error("Starting Healthcare MCP Server");
    console.error("=================================");

    const app = express();

    app.use(express.json());

    const transport =
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
      });

    await server.connect(transport);

    app.all("/mcp", async (req, res) => {
       console.log("=================================");
       console.log("MCP REQUEST");
       console.log("METHOD:", req.method);
       console.log("BODY:", JSON.stringify(req.body));
       console.log("=================================");

      try {
        await transport.handleRequest(
          req,
          res,
          req.body
        );
      } catch (error) {
        console.error(error);

        res.status(500).json({
          error: error.message
        });
      }
    });

    app.get("/", (req, res) => {
      res.json({
        name: "Healthcare MCP Server",
        status: "running"
      });
    });

    const PORT =
      process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.error("=================================");
      console.error(
        `Healthcare MCP Server Running on Port ${PORT}`
      );
      console.error("MCP Endpoint: /mcp");
      console.error("=================================");
    });

  } catch (error) {
    console.error("Failed to start MCP Server");
    console.error(error);

    process.exit(1);
  }
}

startServer();