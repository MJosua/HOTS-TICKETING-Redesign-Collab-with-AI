
import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const divisions = [
  { 
    id: 1, 
    name: "International Operation", 
    code: "IO", 
    head: "Yosua Gultom", 
    members: 15, 
    activeTickets: 8,
    budget: "Rp 2,500,000,000",
    description: "Handles international business operations and partnerships"
  },
  { 
    id: 2, 
    name: "Produksi", 
    code: "PROD", 
    head: "Ahmad Rahman", 
    members: 25, 
    activeTickets: 12,
    budget: "Rp 5,000,000,000",
    description: "Manufacturing and production operations"
  },
  { 
    id: 3, 
    name: "Marketing", 
    code: "MKT", 
    head: "Siti Nurhaliza", 
    members: 12, 
    activeTickets: 5,
    budget: "Rp 1,800,000,000",
    description: "Marketing campaigns and brand management"
  },
  { 
    id: 4, 
    name: "Finance", 
    code: "FIN", 
    head: "Budi Santoso", 
    members: 8, 
    activeTickets: 3,
    budget: "Rp 1,200,000,000",
    description: "Financial planning and accounting operations"
  },
  { 
    id: 5, 
    name: "Gudang", 
    code: "WH", 
    head: "John Doe", 
    members: 10, 
    activeTickets: 7,
    budget: "Rp 800,000,000",
    description: "Warehouse and inventory management"
  },
];

const DivisionManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Division Management</h1>
          <p className="text-gray-600">Manage organizational divisions and hierarchies</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Division
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Divisions</p>
                <p className="text-2xl font-semibold text-gray-900">{divisions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {divisions.reduce((sum, div) => sum + div.members, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {divisions.reduce((sum, div) => sum + div.activeTickets, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Team Size</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(divisions.reduce((sum, div) => sum + div.members, 0) / divisions.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Division Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Division</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Division Head</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Active Tickets</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divisions.map((division) => (
                <TableRow key={division.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{division.name}</div>
                      <div className="text-sm text-gray-600">{division.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{division.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{division.head}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{division.members} members</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={division.activeTickets > 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {division.activeTickets} tickets
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{division.budget}</TableCell>
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
    </div>
  );
};

export default DivisionManagement;
