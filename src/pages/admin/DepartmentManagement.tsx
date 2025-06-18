
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import DepartmentModal from "@/components/modals/DepartmentModal";
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchDepartments, Department } from '@/store/slices/userManagementSlice';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';

const DepartmentManagement = () => {
  const dispatch = useAppDispatch();
  const { departments, isLoading } = useAppSelector(state => state.userManagement);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const filteredDepartments = departments.filter(department =>
    department.department_name.toLowerCase().includes(searchValue.toLowerCase()) ||
    department.short_name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (department.head_name || '').toLowerCase().includes(searchValue.toLowerCase()) ||
    department.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleSaveDepartment = async (department: any) => {
    try {
      if (modalMode === 'add') {
        await axios.post(`${API_URL}/hots_settings/post/department`, department, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          }
        });
        toast({
          title: "Success",
          description: "Department created successfully",
        });
      } else {
        await axios.put(`${API_URL}/hots_settings/update/department/${selectedDepartment?.department_id}`, department, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          }
        });
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      }
      dispatch(fetchDepartments());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to save department',
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedDepartment) {
      try {
        await axios.delete(`${API_URL}/hots_settings/delete/department/${selectedDepartment.department_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          }
        });
        toast({
          title: "Success",
          description: "Department deleted successfully",
        });
        dispatch(fetchDepartments());
        setIsDeleteModalOpen(false);
        setSelectedDepartment(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || 'Failed to delete department',
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedDepartment(null);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  return (
    <AppLayout 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
      searchPlaceholder="Search departments..."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600">Manage organizational departments</p>
          </div>
          <Button onClick={handleAddDepartment} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Departments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.filter(d => d.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.reduce((sum, d) => sum + d.employee_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Monitor className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Department Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departments.length > 0 ? Math.round(departments.reduce((sum, d) => sum + d.employee_count, 0) / departments.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Departments ({filteredDepartments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-lg">Loading departments...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Code</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => (
                    <TableRow key={department.department_id}>
                      <TableCell className="font-mono font-medium">
                        {highlightText(department.department_shortname, searchValue)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {highlightText(department.department_name, searchValue)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {highlightText(department.description, searchValue)}
                      </TableCell>
                      <TableCell>{highlightText(department.head_name || 'Unassigned', searchValue)}</TableCell>
                      <TableCell>{department.employee_count}</TableCell>
                      <TableCell>{getStatusBadge(department.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDepartment(department)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDepartment(department)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          department={selectedDepartment}
          mode={modalMode}
          onSave={handleSaveDepartment}
        />

        <AlertDialog open={isDeleteModalOpen} onOpenChange={handleDeleteCancel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedDepartment?.name}"? This action cannot be undone and will affect all employees in this department.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default DepartmentManagement;
