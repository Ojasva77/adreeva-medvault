import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  action: string;
  created_at: string;
  profiles: { full_name: string } | null;
  books: { title: string } | null;
}

const ActivityLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("id, action, created_at, profiles:user_id(full_name), books:book_id(title)")
        .order("created_at", { ascending: false })
        .limit(100);

      setLogs((data as any) || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.profiles?.full_name || "Unknown"}</TableCell>
                  <TableCell>{log.books?.title || "Unknown"}</TableCell>
                  <TableCell className="capitalize">{log.action}</TableCell>
                  <TableCell>{format(new Date(log.created_at), "PPp")}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No activity yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
