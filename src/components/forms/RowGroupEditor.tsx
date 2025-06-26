import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { FormField, RowGroup } from '@/types/formTypes';

interface RowGroupEditorProps {
  rowGroups: RowGroup[];
  onUpdate: (rowGroups: RowGroup[]) => void;
}

export const RowGroupEditor: React.FC<RowGroupEditorProps> = ({ rowGroups, onUpdate }) => {
  const addRowGroup = () => {
    const newRowGroup: RowGroup = {
      rowGroup: [
        { new_field_1: 'value1' },
        { new_field_2: 'value2' }
      ]
    };
    onUpdate([...rowGroups, newRowGroup]);
  };

  const removeRowGroup = (index: number) => {
    const updated = rowGroups.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const moveRowGroup = (index: number, direction: 'up' | 'down') => {
    const newRowGroups = [...rowGroups];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newRowGroups.length) {
      [newRowGroups[index], newRowGroups[newIndex]] = [newRowGroups[newIndex], newRowGroups[index]];
      onUpdate(newRowGroups);
    }
  };

  const updateRowGroup = (groupIndex: number, updatedGroup: RowGroup) => {
    const updated = [...rowGroups];
    updated[groupIndex] = updatedGroup;
    onUpdate(updated);
  };

  const addFieldToRow = (groupIndex: number) => {
    const updated = [...rowGroups];
    if (updated[groupIndex].rowGroup.length < 3) {
      const fieldNumber = updated[groupIndex].rowGroup.length + 1;
      updated[groupIndex].rowGroup.push({
        [`new_field_${groupIndex}_${fieldNumber}`]: ''
      });
      onUpdate(updated);
    }
  };

  const removeFieldFromRow = (groupIndex: number, fieldIndex: number) => {
    const updated = [...rowGroups];
    if (updated[groupIndex].rowGroup.length > 1) {
      updated[groupIndex].rowGroup = updated[groupIndex].rowGroup.filter((_, i) => i !== fieldIndex);
      onUpdate(updated);
    }
  };

  

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Row Groups</h3>
        <Button size="sm" onClick={addRowGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row Group
        </Button>
      </div>

      {rowGroups.map((rowGroup, groupIndex) => (
        <Card key={groupIndex} className="border-l-4 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                Row Group {groupIndex + 1}
              </CardTitle>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => moveRowGroup(groupIndex, 'up')} 
                  disabled={groupIndex === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => moveRowGroup(groupIndex, 'down')} 
                  disabled={groupIndex === rowGroups.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => addFieldToRow(groupIndex)}
                  disabled={rowGroup.rowGroup.length >= 3}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => removeRowGroup(groupIndex)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rowGroup.rowGroup.map((field, fieldIndex) => (
                <div key={fieldIndex} className="p-3 border border-muted rounded">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={Object.keys(field)[0] || ''}
                        onChange={(e) => {
                          const updated = [...rowGroups];
                          const oldKey = Object.keys(field)[0];
                          const newKey = e.target.value;
                          const value = field[oldKey];
                          delete updated[groupIndex].rowGroup[fieldIndex][oldKey];
                          updated[groupIndex].rowGroup[fieldIndex][newKey] = value;
                          onUpdate(updated);
                        }}
                        placeholder="Field Name"
                        className="text-sm font-medium"
                      />
                      {rowGroup.rowGroup.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => removeFieldFromRow(groupIndex, fieldIndex)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {rowGroups.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground mb-4">No row groups created yet</p>
          <Button onClick={addRowGroup}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Row Group
          </Button>
        </div>
      )}
    </div>
  );
};
