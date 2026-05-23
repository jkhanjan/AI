
const REQUIRED_FIELDS = [
  "requestId",
  "sessionId",
  "provider",
  "model",
  "status",
  "latencyMs",
  "startedAt",
  "completedAt",
];

const VALID_STATUSES = ["success", "error"];

function validateLogPayload(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Request body must be a JSON object." });
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return res.status(400).json({ error: `Missing required field: "${field}"` });
    }
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return res.status(400).json({
      error: `Invalid status "${body.status}". Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  if (typeof body.latencyMs !== "number" || body.latencyMs < 0) {
    return res.status(400).json({ error: '"latencyMs" must be a non-negative number.' });
  }

  for (const field of ["startedAt", "completedAt"]) {
    if (isNaN(Date.parse(body[field]))) {
      return res.status(400).json({ error: `"${field}" is not a valid ISO timestamp.` });
    }
  }

  if (body.usage !== undefined) {
    if (typeof body.usage !== "object" || Array.isArray(body.usage)) {
      return res.status(400).json({ error: '"usage" must be an object.' });
    }
  }

  next();
}

module.exports = { validateLogPayload };