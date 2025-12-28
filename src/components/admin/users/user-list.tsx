"use client";

import { deleteUserAction } from "@/app/_actions/user";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserListProps {
  users: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
  }[];
}

export default function UserList({ users }: UserListProps) {
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    const result = await deleteUserAction(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="divide-y">
      {users.map((user) => (
        <div key={user.id} className="p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              {user.role === "ADMIN" ? (
                <Shield className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              user.role === "ADMIN" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {user.role}
            </span>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(user.id, user.email)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
