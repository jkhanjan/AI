const GITHUB_URL_REGEX = /https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/i;

function extractGithubUrl(text) {
  const match = text.match(GITHUB_URL_REGEX);
  return match ? match[0] : null;
}
const REPO_READER_BASE_URL = process.env.REPO_READER_BASE_URL;

async function analyzeRepoForChat(repoUrl) {
  const response = await fetch(`${REPO_READER_BASE_URL}/api/public`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": process.env.REPO_READER_INTERNAL_KEY,
    },
    body: JSON.stringify({ repoUrl }),
  });

  if (!response.ok) {
    throw new Error(`repo-reader returned ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "repo-reader analysis failed");
  }

  return data;
}

module.exports = { extractGithubUrl, analyzeRepoForChat };