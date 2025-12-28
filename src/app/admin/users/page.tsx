import { requireSuperAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import UserList from "@/components/admin/users/user-list";
import CreateUserForm from "@/components/admin/users/create-user-form";

export default async function UsersPage() {
  await requireSuperAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, createdAt: true },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Create New User</h2>
            <div className="p-4 border rounded-lg bg-card text-card-foreground">
                <CreateUserForm />
            </div>
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Existing Users</h2>
            <div className="border rounded-lg overflow-hidden">
                <UserList users={users} />
            </div>
        </div>
      </div>
    </div>
  );
}
