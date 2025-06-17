import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout/AppLayout";
import DivisionModal from "@/components/modals/DivisionModal";

interface Division {
  id: string;
  name: string;
  code: string;
  description: string;
  parentDivision: string;
  head: string;
  status: string;
  employeeCount: number;
}

const initialDivisions: Division[] = [
  {
    id: "1",
    name: "Noodle Division",
    code: "NDL",
    description: "Main noodle production and operations",
    parentDivision: "Production",
    head: "John Doe",
    status: "active",
    employeeCount: 245
  },
  {
    id: "2", 
    name: "Quality Control",
    code: "QC",
    description: "Product quality assurance and testing",
    parentDivision: "Noodle Division",
    head: "Jane Smith",
    status: "active",
    employeeCount: 32
  },
  {
    id: "3",
    name: "Maintenance",
    code: "MNT",
    description: "Equipment and facility maintenance",
    parentDivision: "Operations",
    head: "Ahmad Rahman",
    status: "active",
    employeeCount: 18
  },
  {
    id: "4",
    name: "Human Resources",
    code: "HR",
    description: "Employee management and development",
    parentDivision: "Corporate",
    head: "Siti Nurhaliza",
    status: "inactive",
    employeeCount: 12
  }
];

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const filteredDivisions = divisions.filter(division =>
    division.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    division.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    division.head.toLowerCase().includes(searchValue.toLowerCase()) ||
    division.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddDivision = () => {
    setSelectedDivision(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsDeleteModalOpen(true);
  };

  const handleSaveDivision = (division: Division) => {
    if (modalMode === 'add') {
      setDivisions([...divisions, { ...division, employeeCount: 0 }]);
    } else {
      setDivisions(divisions.map(d => d.id === division.id ? { ...division, employeeCount: d.employeeCount } : d));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedDivision) {
      setDivisions(divisions.filter(d => d.id !== selectedDivision.id));
      setIsDeleteModalOpen(false);
      setSelectedDivision(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedDivision(null);
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
      searchPlaceholder="Search divisions..."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Division Management</h1>
            <p className="text-gray-600">Manage organizational divisions and departments</p>
          </div>
          <Button onClick={handleAddDivision} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Division
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
                  <p className="text-sm text-gray-600">Total Divisions</p>
                  <p className="text-2xl font-bold text-gray-900">{divisions.length}</p>
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
                  <p className="text-sm text-gray-600">Active Divisions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {divisions.filter(d => d.status === 'active').length}
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
                    {divisions.reduce((sum, d) => sum + d.employeeCount, 0)}
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
                  <p className="text-sm text-gray-600">Avg. Division Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(divisions.reduce((sum, d) => sum + d.employeeCount, 0) / divisions.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Divisions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Divisions ({filteredDivisions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division Code</TableHead>
                  <TableHead>Division Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDivisions.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell className="font-mono font-medium">
                      {highlightText(division.code, searchValue)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {highlightText(division.name, searchValue)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {highlightText(division.description, searchValue)}
                    </TableCell>
                    <TableCell>{highlightText(division.head, searchValue)}</TableCell>
                    <TableCell>{division.employeeCount}</TableCell>
                    <TableCell>{getStatusBadge(division.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDivision(division)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDivision(division)}
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
          </CardContent>
        </Card>

        {/* Modals */}
        <DivisionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          division={selectedDivision}
          mode={modalMode}
          onSave={handleSaveDivision}
        />

        <AlertDialog open={isDeleteModalOpen} onOpenChange={handleDeleteCancel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Division</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedDivision?.name}"? This action cannot be undone and will affect all employees in this division.
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

export default DivisionManagement;
