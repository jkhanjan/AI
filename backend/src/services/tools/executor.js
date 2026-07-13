const { analyzeRepoForChat } = require("../repo-reader/repoReader");

async function executeTool(call) {
  const args = JSON.parse(call.function.arguments);
  console.log(args, 'args')

  switch (call.function.name) {
    case "analyze_github_repo": {
      const analysis = await analyzeRepoForChat(args.url, args.focus);
      console.log(analysis, 'analysis')
      return {
        result: {
          summary: analysis.summary,
          techStack: analysis.techStack,
          architecture: analysis.architecture,
          features: analysis.features
        },
        deepLink: analysis.deepLink
      };
    }
    default:
      throw new Error(`Unknown tool: ${call.function.name}`);
  }
}

module.exports = { executeTool };