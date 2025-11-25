import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { getUsersAPI, createUserAPI, deleteUserAPI, isLoggedAPI, getUserInfoAPI } from "@/app/api";
import type { UserType } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Admin = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUsersAPI();
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newEmail || !newUsername || !newPassword) return;
    try {
      await createUserAPI(newEmail, newUsername, newPassword);
      setNewEmail("");
      setNewUsername("");
      setNewPassword("");
      await fetchUsers();
      toast("User created");
    } catch (err) {
      console.error("Failed to create user", err);
      toast("Failed to create user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUserAPI(id);
      await fetchUsers();
      toast("User deleted");
    } catch (err) {
      console.error("Failed to delete user", err);
      toast("Failed to delete user");
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await isLoggedAPI();
        if (!res.success || !res.userId) {
          navigate("/");
          return;
        }

        const user = await getUserInfoAPI(res.userId);
        if (user.role !== "ADMIN") {
          navigate("/");
          return;
        }

        fetchUsers();
      } catch {
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  return (
    <>
      <Header />
      <div className="container p-4 space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>

        <Card>
          <CardHeader>
            <CardTitle>Add User</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={handleAddUser} className="whitespace-nowrap">
              Add User
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <p>Loading users...</p>}
            {!isLoading && error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && users.length === 0 ? (
              <p>No users</p>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <span className="text-xs">Role: {user.role}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Admin;
