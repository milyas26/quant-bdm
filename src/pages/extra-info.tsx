import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Save, X, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getExtraInfos, createExtraInfo, updateExtraInfo, deleteExtraInfo } from "@/lib/apis/extra-info/extra-info-api"
import type { ExtraInfo as ExtraInfoType } from "@/lib/apis/extra-info/interface"

const ExtraInfo = () => {
  const [data, setData] = useState<ExtraInfoType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState({ label: "", value: "" })
  const [newValues, setNewValues] = useState({ label: "", value: "" })
  const [isAdding, setIsAdding] = useState(false)

  const fetchData = async () => {
    try { setLoading(true); setData(await getExtraInfos()) }
    catch { toast.error("Failed to fetch") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSaveEdit = async (id: number) => {
    try { await updateExtraInfo(id, editValues); toast.success("Updated"); setEditingId(null); fetchData() }
    catch { toast.error("Failed to update") }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return
    try { await deleteExtraInfo(id); toast.success("Deleted"); fetchData() }
    catch { toast.error("Failed to delete") }
  }

  const handleAdd = async () => {
    if (!newValues.label || !newValues.value) return toast.error("Both fields required")
    try { await createExtraInfo(newValues); toast.success("Added"); setNewValues({ label: "", value: "" }); setIsAdding(false); fetchData() }
    catch { toast.error("Failed to add") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold tracking-tight">Extra Info</h1>
        <Button onClick={() => setIsAdding(!isAdding)} disabled={isAdding} className="h-8 rounded-sm font-mono text-[11px]">
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      <div className="rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-8 font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-64">Label</TableHead>
              <TableHead className="h-8 font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Value</TableHead>
              <TableHead className="h-8 font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="border-border">
                <TableCell><Input placeholder="Label" value={newValues.label} onChange={(e) => setNewValues({ ...newValues, label: e.target.value })} className="h-8 rounded-sm font-mono" /></TableCell>
                <TableCell><Input placeholder="Value" value={newValues.value} onChange={(e) => setNewValues({ ...newValues, value: e.target.value })} className="h-8 rounded-sm font-mono" /></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAdd}><Save className="h-3 w-3 text-positive" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsAdding(false)}><X className="h-3 w-3 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            )}
            {loading ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center font-mono text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" /> Loading...</TableCell></TableRow>
            ) : data.length === 0 && !isAdding ? (
              <TableRow><TableCell colSpan={3} className="h-24 text-center font-mono text-sm text-muted-foreground">No data</TableCell></TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-mono text-sm">
                    {editingId === item.id ? <Input value={editValues.label} onChange={(e) => setEditValues({ ...editValues, label: e.target.value })} className="h-8 rounded-sm font-mono" /> : item.label}
                  </TableCell>
                  <TableCell className="max-w-xl">
                    {editingId === item.id ? <Input value={editValues.value} onChange={(e) => setEditValues({ ...editValues, value: e.target.value })} className="h-8 rounded-sm font-mono" /> : <p className="font-mono text-xs text-muted-foreground break-all">{item.value}</p>}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(item.id)}><Save className="h-3 w-3 text-positive" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3 w-3 text-destructive" /></Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(item.id); setEditValues({ label: item.label, value: item.value }) }}><Pencil className="h-3 w-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ExtraInfo
