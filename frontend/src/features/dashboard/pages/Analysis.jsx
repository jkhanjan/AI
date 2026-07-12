import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = "http://localhost:4000/api/ingest";

const STATUS_VARIANT = {
  success: "default",
  error: "destructive",
  timeout: "secondary",
};

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  return `${Math.round(diff / 3600000)}h ago`;
}

function formatLatency(ms) {
  if (!ms && ms !== 0) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatTokens(n) {
  if (!n) return "0";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function Analysis() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filters
  const [status, setStatus] = useState("all");
  const [sessionId, setSessionId] = useState("");
  const [limit, setLimit] = useState("25");

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit });
      if (status && status !== "all") params.set("status", status);
      if (sessionId.trim()) params.set("sessionId", sessionId.trim());

      const res = await fetch(`${API_BASE}/logs?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [status, limit]);

  // derived metrics
  const total = logs.length;
  const successCount = logs.filter((l) => l.status === "success").length;
  const successRate = total ? Math.round((successCount / total) * 100) : 0;
  const avgLatency = total
    ? Math.round(logs.reduce((a, l) => a + (l.latencyMs || 0), 0) / total)
    : 0;
  const totalTokens = logs.reduce((a, l) => a + (l.usage?.totalTokens || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">LLM Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your pipeline usage and performance
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{successRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatLatency(avgLatency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatTokens(totalTokens)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="timeout">Timeout</SelectItem>
          </SelectContent>
        </Select>

        <Select value={limit} onValueChange={setLimit}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="25">25 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Filter by session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-52"
        />
        <Button variant="secondary" onClick={fetchLogs} disabled={loading}>
          Apply
        </Button>
      </div>

      {/* error state */}
      {error && (
        <p className="text-sm text-destructive">Failed to load logs: {error}</p>
      )}

      {/* logs table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Provider / Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Input preview</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!loading && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                logs.map((log) => (
                  <TableRow key={log.requestId}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.requestId}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.provider}{" "}
                      <span className="text-muted-foreground">/ {log.model}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[log.status] || "secondary"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatLatency(log.latencyMs)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(log.usage?.totalTokens || 0).toLocaleString()}
                    </TableCell>
                    <TableCell
                      className="text-xs text-muted-foreground max-w-[180px] truncate"
                      title={log.inputPreview || ""}
                    >
                      {log.inputPreview || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.startedAt ? relativeTime(log.startedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}