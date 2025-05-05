
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Attendance = {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  status: string;
  notes: string | null;
  profiles: {
    full_name: string;
  };
};

export function AttendanceTable() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('check_in', { ascending: false });

      if (error) throw error;

      setAttendances(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading attendance records...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendances.map((attendance) => (
            <TableRow key={attendance.id}>
              <TableCell>{attendance.profiles?.full_name}</TableCell>
              <TableCell>
                {format(new Date(attendance.check_in), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                {attendance.check_out
                  ? format(new Date(attendance.check_out), 'MMM d, yyyy HH:mm')
                  : '-'}
              </TableCell>
              <TableCell>{attendance.status}</TableCell>
              <TableCell>{attendance.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
