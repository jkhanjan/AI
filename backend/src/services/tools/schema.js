const tools = [
  {
    type: "function",
    function: {
      name: "analyze_github_repo",
      description: "Analyze a GitHub repository to answer questions about its architecture, tech stack, features, or specific aspects like testing, auth, or deployment. Call this whenever the user references a repo (by URL or from earlier context) and asks something that needs repo-specific knowledge.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The GitHub repository URL." },
          focus: { type: "string", description: "What aspect the user cares about, e.g. 'testing', 'architecture', 'auth flow'." }
        },
        required: ["url"]
      }
    }
  }
];

module.exports = { tools };