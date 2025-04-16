'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle,
  Search
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getRolePermissions, 
  logActivity 
} from '@/lib/firebase';
import { User, UserRole, RolePermission } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { cn, safeFormatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'staff' as UserRole,
      isActive: true
    }
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersData = await getUsers();
        setUsers(usersData as User[]);
        
        // Fetch role permissions
        const roles: UserRole[] = ['admin', 'manager', 'receptionist', 'staff'];
        const permissionsPromises = roles.map(role => getRolePermissions(role));
        const permissionsData = await Promise.all(permissionsPromises);
        setRolePermissions(permissionsData.filter(Boolean) as unknown as RolePermission[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOpenUserDialog = (user: User | null = null) => {
    if (user) {
      setSelectedUser(user);
      userForm.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setSelectedUser(null);
      userForm.reset({
        name: '',
        email: '',
        role: 'staff',
        isActive: true
      });
    }
    setUserDialogOpen(true);
  };
  
  const handleOpenPermissionDialog = (role: UserRole) => {
    setSelectedRole(role);
    setPermissionDialogOpen(true);
  };
  
  const handleCreateUser = async () => {
    try {
      const values = userForm.getValues();
      
      // In a real app, you would create the user in Firebase Auth first
      // and then store the user data in Firestore
      
      const userData: Omit<User, 'id'> = {
        name: values.name,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const newUser = await createUser(userData);
      
      // Log activity
      await logActivity({
        userId: 'currentUserId', // In a real app, this would be the current user's ID
        userName: 'John Doe', // In a real app, this would be the current user's name
        action: 'create',
        resourceType: 'user',
        resourceId: newUser.id,
        details: `Created user ${values.name} with role ${values.role}`,
        timestamp: Timestamp.now()
      });
      
      // Refresh users list
      const usersData = await getUsers();
      setUsers(usersData as User[]);
      
      setUserDialogOpen(false);
      userForm.reset();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const values = userForm.getValues();
      
      const userData: Partial<User> = {
        name: values.name,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
        updatedAt: Timestamp.now()
      };
      
      await updateUser(selectedUser.id, userData);
      
      // Log activity
      await logActivity({
        userId: 'currentUserId', // In a real app, this would be the current user's ID
        userName: 'John Doe', // In a real app, this would be the current user's name
        action: 'update',
        resourceType: 'user',
        resourceId: selectedUser.id,
        details: `Updated user ${values.name}`,
        timestamp: Timestamp.now()
      });
      
      // Refresh users list
      const usersData = await getUsers();
      setUsers(usersData as User[]);
      
      setUserDialogOpen(false);
      setSelectedUser(null);
      userForm.reset();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    try {
      await deleteUser(user.id);
      
      // Log activity
      await logActivity({
        userId: 'currentUserId', // In a real app, this would be the current user's ID
        userName: 'John Doe', // In a real app, this would be the current user's name
        action: 'delete',
        resourceType: 'user',
        resourceId: user.id,
        details: `Deleted user ${user.name}`,
        timestamp: Timestamp.now()
      });
      
      // Refresh users list
      const usersData = await getUsers();
      setUsers(usersData as User[]);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  
  const handleUpdatePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      // In a real app, you would update the role permissions in Firestore
      
      // Log activity
      await logActivity({
        userId: 'currentUserId', // In a real app, this would be the current user's ID
        userName: 'John Doe', // In a real app, this would be the current user's name
        action: 'update',
        resourceType: 'system',
        details: `Updated permissions for role ${selectedRole}`,
        timestamp: Timestamp.now()
      });
      
      // Refresh role permissions
      const roles: UserRole[] = ['admin', 'manager', 'receptionist', 'staff'];
      const permissionsPromises = roles.map(role => getRolePermissions(role));
      const permissionsData = await Promise.all(permissionsPromises);
      setRolePermissions(permissionsData.filter(Boolean) as unknown as RolePermission[]);
      
      setPermissionDialogOpen(false);
      setSelectedRole(undefined);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users and permissions</p>
          </div>
          
          <Button onClick={() => handleOpenUserDialog(null)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Card>
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse text-primary">Loading...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className="capitalize">{user.role}</span>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {safeFormatDate(user.lastLogin, 'Never')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenUserDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-4">
            <Card>
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse text-primary">Loading...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium capitalize">Admin</TableCell>
                      <TableCell>Full access to all features</TableCell>
                      <TableCell>{users.filter(u => u.role === 'admin').length}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissionDialog('admin')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium capitalize">Manager</TableCell>
                      <TableCell>Access to most features except user management</TableCell>
                      <TableCell>{users.filter(u => u.role === 'manager').length}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissionDialog('manager')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium capitalize">Receptionist</TableCell>
                      <TableCell>Access to bookings, guests, and rooms</TableCell>
                      <TableCell>{users.filter(u => u.role === 'receptionist').length}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissionDialog('receptionist')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium capitalize">Staff</TableCell>
                      <TableCell>Limited access to basic features</TableCell>
                      <TableCell>{users.filter(u => u.role === 'staff').length}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPermissionDialog('staff')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* User Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {selectedUser 
                  ? 'Update user details and permissions.' 
                  : 'Create a new user with specific role and permissions.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...userForm}>
              <div className="space-y-4 py-2">
                <FormField
                  control={userForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          User will {field.value ? 'be able' : 'not be able'} to login
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                >
                  {selectedUser ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Permissions Dialog */}
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Permissions` : 'Role Permissions'}
              </DialogTitle>
              <DialogDescription>
                Configure what this role can access and modify.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
              {selectedRole && rolePermissions.find(rp => rp.role === selectedRole) && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Dashboard Access</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Dashboard</p>
                        <p className="text-sm text-muted-foreground">Access to dashboard overview</p>
                      </div>
                      <Switch defaultChecked={rolePermissions.find(rp => rp.role === selectedRole)?.permissions.dashboard} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Module Permissions</h3>
                    
                    {Object.entries(rolePermissions.find(rp => rp.role === selectedRole)?.permissions || {})
                      .filter(([key]) => key !== 'dashboard' && key !== 'settings' && typeof rolePermissions.find(rp => rp.role === selectedRole)?.permissions[key as keyof RolePermission['permissions']] === 'object')
                      .map(([module, permissions]) => (
                        <div key={module} className="border rounded-lg p-4">
                          <h4 className="text-sm font-medium capitalize mb-2">{module}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(permissions as Record<string, boolean>).map(([action, value]) => (
                              <div key={`${module}-${action}`} className="flex items-center justify-between">
                                <p className="text-sm capitalize">{action}</p>
                                <Switch defaultChecked={value} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Settings</p>
                        <p className="text-sm text-muted-foreground">Access to system settings</p>
                      </div>
                      <Switch defaultChecked={rolePermissions.find(rp => rp.role === selectedRole)?.permissions.settings} />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPermissionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleUpdatePermissions}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 