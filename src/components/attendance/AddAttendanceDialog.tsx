
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = {
  userId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
};

export function AddAttendanceDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name');
    setUsers(data || []);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .insert([{
          user_id: data.userId,
          check_in: data.checkIn,
          check_out: data.checkOut || null,
          status: data.status,
          notes: data.notes,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance record added successfully",
      });
      
      setOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast({
        title: "Error",
        description: "Failed to add attendance record",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) loadUsers();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attendance Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="userId">User</Label>
            <select
              id="userId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              {...register("userId")}
              required
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="checkIn">Check In</Label>
            <Input
              id="checkIn"
              type="datetime-local"
              {...register("checkIn")}
              required
            />
          </div>

          <div>
            <Label htmlFor="checkOut">Check Out</Label>
            <Input
              id="checkOut"
              type="datetime-local"
              {...register("checkOut")}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              {...register("status")}
              required
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
