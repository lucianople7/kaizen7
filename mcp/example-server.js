process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  for (const line of chunk.split(/\r?\n/).filter(Boolean)) {
    const request = JSON.parse(line);
    const response = {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        server: "kaizen7-example-mcp",
        method: request.method,
        params: request.params || {},
        tools: [
          {
            name: "create_growth_pack",
            description: "Genera un growth pack para un producto.",
          },
          {
            name: "score_product",
            description: "Evalua claridad, margen, canal, riesgo y potencial.",
          },
        ],
      },
    };
    process.stdout.write(JSON.stringify(response) + "\n");
  }
});
