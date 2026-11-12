
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const loadUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      const userList = response.data.users || [];

      setUsers(userList);

      const roleValues = {};
      userList.forEach((user) => {
        roleValues[user._id] = user.role;
      });

      setRoles(roleValues);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load users."
      );
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    if (currentUser.role?.toLowerCase() !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadUsers();
  }, []);

  const handleRoleChange = async (id) => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.put(`/admin/users/${id}/role`, {
        role: roles[id]
      });

      setMessage(response.data.message || "User role updated!");
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update user role."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <p>PARKEASE / ADMINISTRATION</p>
          <h1>User Management</h1>
          <span>View registered users and manage their access roles.</span>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <section className="admin-users-summary">
        <div>
          <span>Total Registered Users</span>
          <h2>{users.length}</h2>
        </div>
      </section>

      {message && <p className="users-success">{message}</p>}
      {error && <p className="users-error">{error}</p>}

      <section className="admin-users-card">
        <div className="admin-users-heading">
          <div>
            <h2>Registered Users</h2>
            <p>Manage user roles and permissions.</p>
          </div>

          <button onClick={loadUsers}>Refresh</button>
        </div>

        <div className="admin-users-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || "—"}</td>
                  <td>
                    <span className="user-role-badge">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select
                      value={roles[user._id] || user.role}
                      onChange={(e) =>
                        setRoles({
                          ...roles,
                          [user._id]: e.target.value
                        })
                      }
                      disabled={user._id === currentUser.id ||
                        user._id === currentUser._id}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="operator">Operator</option>
                      <option value="security">Security Staff</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="update-user-button"
                      onClick={() => handleRoleChange(user._id)}
                      disabled={
                        loading ||
                        user._id === currentUser.id ||
                        user._id === currentUser._id ||
                        roles[user._id] === user.role
                      }
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="6">No registered users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminUsers;
