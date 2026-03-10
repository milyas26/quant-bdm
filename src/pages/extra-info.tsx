import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getExtraInfos,
  createExtraInfo,
  updateExtraInfo,
  deleteExtraInfo,
} from "@/lib/apis/extra-info/extra-info-api";
import type { ExtraInfo as ExtraInfoType } from "@/lib/apis/extra-info/interface";

const ExtraInfo = () => {
  const [data, setData] = useState<ExtraInfoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ label: string; value: string }>({
    label: "",
    value: "",
  });
  const [newValues, setNewValues] = useState<{ label: string; value: string }>({
    label: "",
    value: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getExtraInfos();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch extra info:", error);
      toast.error("Failed to fetch extra info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: ExtraInfoType) => {
    setEditingId(item.id);
    setEditValues({ label: item.label, value: item.value });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ label: "", value: "" });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await updateExtraInfo(id, editValues);
      toast.success("Extra info updated successfully");
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update extra info:", error);
      toast.error("Failed to update extra info");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteExtraInfo(id);
      toast.success("Extra info deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete extra info:", error);
      toast.error("Failed to delete extra info");
    }
  };

  const handleAdd = async () => {
    if (!newValues.label || !newValues.value) {
      toast.error("Label and Value are required");
      return;
    }
    try {
      await createExtraInfo(newValues);
      toast.success("Extra info added successfully");
      setNewValues({ label: "", value: "" });
      setIsAdding(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create extra info:", error);
      toast.error("Failed to create extra info");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Extra Info</h1>
        <Button onClick={() => setIsAdding(!isAdding)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Label"
                    value={newValues.label}
                    onChange={(e) =>
                      setNewValues({ ...newValues, label: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Value"
                    value={newValues.value}
                    onChange={(e) =>
                      setNewValues({ ...newValues, value: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={handleAdd}>
                      <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsAdding(false)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        value={editValues.label}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            label: e.target.value,
                          })
                        }
                      />
                    ) : (
                      item.label
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    {editingId === item.id ? (
                      <Input
                        value={editValues.value}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            value: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground wrap-break-word line-clamp-4">{item.value}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === item.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSaveEdit(item.id)}
                          >
                            <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExtraInfo;
