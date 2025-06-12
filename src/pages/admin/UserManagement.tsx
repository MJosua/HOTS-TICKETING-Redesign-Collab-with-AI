
import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import UserModal from "@/components/modals/UserModal";
import RoleModal from "@/components/modals/RoleModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

interface UserType {
  id: string;
  name: string;
  email: string;
  division: string;
  role: string;
  status: string;
}

interface RoleType {
  id: string;
  name: string;
  permissions: number;
  description: string;
}

const initialUsers: UserType[] = [
  { id: "1", name: "Yosua Gultom", email: "yosua.gultom@indofood.com", division: "International Operation", role: "Manager", status: "Active" },
  { id: "2", name: "Ahmad Rahman", email: "ahmad.rahman@indofood.com", division: "Produksi", role: "Supervisor", status: "Active" },
  { id: "3", name: "Siti Nurhaliza", email: "siti.nurhaliza@indofood.com", division: "Marketing", role: "Staff", status: "Active" },
  { id: "4", name: "Budi Santoso", email: "budi.santoso@indofood.com", division: "Finance", role: "Staff", status: "Inactive" },
  { id: "5", name: "John Doe", email: "john.doe@indofood.com", division: "Gudang", role: "Supervisor", status: "Active" },
];

const initialRoles: RoleType[] = [
  { id: "1", name: "Administrator", permissions: 15, description: "Full system access" },
  { id: "2", name: "Manager", permissions: 12, description: "Department management" },
  { id: "3", name: "Supervisor", permissions: 8, description: "Team supervision" },
  { id: "4", name: "Staff", permissions: 5, description: "Basic operations" },
];

const divisions = [
  { id: 1, name: "International Operation", head: "Yosua Gultom", members: 15 },
  { id: 2, name: "Produksi", head: "Ahmad Rahman", members: 25 },
  { id: 3, name: "Marketing", head: "Siti Nurhaliza", members: 12 },
  { id: 4, name: "Finance", head: "Budi Santoso", members: 8 },
  { id: 5, name: "Gudang", head: "John Doe", members: 10 },
];

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [roles, setRoles] = useState<RoleType[]>(initialRoles);
  
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [deleteTarget, setDeleteTarget] = useState<{type: 'user' | 'role', item: UserType | RoleType} | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.division.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    role.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  };

  // User handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('add');
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user: UserType) => {
    setDeleteTarget({type: 'user', item: user});
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (user: UserType) => {
    if (modalMode === 'add') {
      setUsers([...users, user]);
    } else {
      setUsers(users.map(u => u.id === user.id ? user : u));
    }
  };

  // Role handlers
  const handleAddRole = () => {
    setSelectedRole(null);
    setModalMode('add');
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: RoleType) => {
    setSelectedRole(role);
    setModalMode('edit');
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = (role: RoleType) => {
    setDeleteTarget({type: 'role', item: role});
    setIsDeleteModalOpen(true);
  };

  const handleSaveRole = (role: RoleType) => {
    if (modalMode === 'add') {
      setRoles([...roles, role]);
    } else {
      setRoles(roles.map(r => r.id === role.id ? role : r));
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'user') {
        setUsers(users.filter(u => u.id !== deleteTarget.item.id));
      } else {
        setRoles(roles.filter(r => r.id !== deleteTarget.item.id));
      }
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrator": return "bg-purple-100 text-purple-800";
      case "Manager": return "bg-blue-100 text-blue-800";
      case "Supervisor": return "bg-green-100 text-green-800";
      case "Staff": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <AppLayout 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
      searchPlaceholder="Search users, roles..."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage users, roles, and organizational structure</p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>System Users ({filteredUsers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium">{highlightText(user.name, searchValue)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{highlightText(user.email, searchValue)}</TableCell>
                        <TableCell>{highlightText(user.division, searchValue)}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {highlightText(user.role, searchValue)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(user)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Roles & Permissions ({filteredRoles.length})</span>
                  </CardTitle>
                  <Button size="sm" onClick={handleAddRole}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{highlightText(role.name, searchValue)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.permissions} permissions</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{highlightText(role.description, searchValue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteRole(role)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="divisions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Division Management</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Division
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Division Name</TableHead>
                      <TableHead>Division Head</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {divisions.map((division) => (
                      <TableRow key={division.id}>
                        <TableCell className="font-medium">{division.name}</TableCell>
                        <TableCell>{division.head}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{division.members} members</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          user={selectedUser}
          mode={modalMode}
          onSave={handleSaveUser}
        />

        <RoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          role={selectedRole}
          mode={modalMode}
          onSave={handleSaveRole}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteTarget?.type === 'user' ? 'User' : 'Role'}`}
          description={`Are you sure you want to delete "${deleteTarget?.item.name}"? This action cannot be undone.`}
        />
      </div>
    </AppLayout>
  );
};

export default UserManagement;
