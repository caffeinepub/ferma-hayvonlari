import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  ChevronDown,
  Filter,
  Hash,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Tractor,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import type { Animal } from "./backend.d";
import {
  useAddAnimal,
  useDeleteAnimal,
  useGetAnimals,
  useSetRemovedDate,
  useUpdateAnimal,
} from "./hooks/useQueries";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ANIMAL_TYPES = [
  { value: "Sigir", label: "🐄 Sigir" },
  { value: "Qo'y", label: "🐑 Qo'y" },
  { value: "Echki", label: "🐐 Echki" },
  { value: "Ot", label: "🐎 Ot" },
  { value: "To'ng'iz", label: "🐖 To'ng'iz" },
  { value: "Tuya", label: "🐫 Tuya" },
  { value: "Tovuq", label: "🐓 Tovuq" },
  { value: "O'rdak", label: "🦆 O'rdak" },
  { value: "Qoʻzichoq", label: "🐣 Qoʻzichoq" },
  { value: "Boshqa", label: "🐾 Boshqa" },
];

function getDaysDiff(
  from: string,
  to?: string,
): { days: number; label: string } {
  const fromDate = new Date(from);
  const toDate = to ? new Date(to) : new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(
    0,
    Math.floor((toDate.getTime() - fromDate.getTime()) / msPerDay),
  );

  if (days < 30) return { days, label: `${days} kun` };
  if (days < 365) {
    const months = Math.floor(days / 30);
    const rem = days % 30;
    return {
      days,
      label: rem > 0 ? `${months} oy ${rem} kun` : `${months} oy`,
    };
  }
  const years = Math.floor(days / 365);
  const remDays = days % 365;
  const months = Math.floor(remDays / 30);
  if (months > 0) return { days, label: `${years} yil ${months} oy` };
  return { days, label: `${years} yil` };
}

function getAnimalEmoji(type: string): string {
  const found = ANIMAL_TYPES.find((t) => t.value === type);
  if (found) return found.label.split(" ")[0];
  return "🐾";
}

function formatDate(dateStr: string): string {
  return dateStr || "—";
}

type FilterType = "all" | "active" | "removed";

// ─── Animal Form Dialog ──────────────────────────────────────────────────────

interface AnimalFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editAnimal?: Animal | null;
}

function AnimalFormDialog({
  open,
  onOpenChange,
  editAnimal,
}: AnimalFormDialogProps) {
  const addAnimal = useAddAnimal();
  const updateAnimal = useUpdateAnimal();

  const [number, setNumber] = useState(editAnimal?.number ?? "");
  const [animalType, setAnimalType] = useState(editAnimal?.animalType ?? "");
  const [birthDate, setBirthDate] = useState(editAnimal?.birthDate ?? "");

  // Sync when editing animal changes
  useState(() => {
    setNumber(editAnimal?.number ?? "");
    setAnimalType(editAnimal?.animalType ?? "");
    setBirthDate(editAnimal?.birthDate ?? "");
  });

  const isEditing = !!editAnimal;
  const isPending = addAnimal.isPending || updateAnimal.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim() || !animalType || !birthDate) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    try {
      if (isEditing && editAnimal) {
        await updateAnimal.mutateAsync({
          id: editAnimal.id,
          number: number.trim(),
          animalType,
          birthDate,
        });
        toast.success("Hayvon ma'lumotlari yangilandi");
      } else {
        await addAnimal.mutateAsync({
          number: number.trim(),
          animalType,
          birthDate,
        });
        toast.success("Yangi hayvon qo'shildi");
      }
      onOpenChange(false);
      setNumber("");
      setAnimalType("");
      setBirthDate("");
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  }

  function handleOpenChange(v: boolean) {
    onOpenChange(v);
    if (!v) {
      setNumber(editAnimal?.number ?? "");
      setAnimalType(editAnimal?.animalType ?? "");
      setBirthDate(editAnimal?.birthDate ?? "");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="add_animal.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Hayvonni tahrirlash" : "Yangi hayvon qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="animal-number" className="font-medium">
              Hayvon raqami
            </Label>
            <Input
              id="animal-number"
              placeholder="Masalan: A-001"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              data-ocid="add_animal.number_input"
              className="border-border bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="animal-type" className="font-medium">
              Hayvon turi
            </Label>
            <Select value={animalType} onValueChange={setAnimalType}>
              <SelectTrigger
                id="animal-type"
                data-ocid="add_animal.type_input"
                className="border-border bg-card"
              >
                <SelectValue placeholder="Turni tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {ANIMAL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth-date" className="font-medium">
              Tug'ilgan sana
            </Label>
            <Input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              data-ocid="add_animal.birthdate_input"
              className="border-border bg-card"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              data-ocid="add_animal.cancel_button"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="add_animal.submit_button"
              className="bg-primary text-primary-foreground"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Remove Date Dialog ──────────────────────────────────────────────────────

interface RemoveDateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  animal: Animal | null;
}

function RemoveDateDialog({
  open,
  onOpenChange,
  animal,
}: RemoveDateDialogProps) {
  const setRemovedDate = useSetRemovedDate();
  const today = new Date().toISOString().split("T")[0];
  const [removeDate, setRemoveDate] = useState(today);

  async function handleConfirm() {
    if (!animal) return;
    try {
      await setRemovedDate.mutateAsync({
        id: animal.id,
        removedDate: removeDate,
      });
      toast.success(`${animal.number} olib ketildi deb belgilandi`);
      onOpenChange(false);
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" data-ocid="remove_animal.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <LogOut className="h-5 w-5 text-amber-600" />
            Olib ketildi deb belgilash
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {animal && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {getAnimalEmoji(animal.animalType)} {animal.number}
              </span>{" "}
              — {animal.animalType}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="remove-date" className="font-medium">
              Qachon olib ketildi?
            </Label>
            <Input
              id="remove-date"
              type="date"
              value={removeDate}
              onChange={(e) => setRemoveDate(e.target.value)}
              data-ocid="remove_animal.date_input"
              className="border-border bg-card"
              max={today}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-ocid="remove_animal.cancel_button"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={setRemovedDate.isPending}
            data-ocid="remove_animal.confirm_button"
            className="bg-amber-700 hover:bg-amber-800 text-white"
          >
            {setRemovedDate.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  animal: Animal | null;
}

function DeleteDialog({ open, onOpenChange, animal }: DeleteDialogProps) {
  const deleteAnimal = useDeleteAnimal();

  async function handleConfirm() {
    if (!animal) return;
    try {
      await deleteAnimal.mutateAsync({ id: animal.id });
      toast.success(`${animal.number} o'chirildi`);
      onOpenChange(false);
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-ocid="delete_animal.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Hayvonni o'chirish
          </AlertDialogTitle>
          <AlertDialogDescription>
            {animal && (
              <>
                <span className="font-semibold text-foreground">
                  {getAnimalEmoji(animal.animalType)} {animal.number}
                </span>{" "}
                —{" "}
              </>
            )}
            Bu hayvonni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib
            bo'lmaydi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-ocid="delete_animal.cancel_button">
            Bekor qilish
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            data-ocid="delete_animal.confirm_button"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteAnimal.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            O'chirish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  dataOcid: string;
}

function StatsCard({
  title,
  value,
  icon,
  colorClass,
  dataOcid,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        data-ocid={dataOcid}
        className={`border-2 ${colorClass} overflow-hidden relative`}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <span className="font-display text-4xl font-bold text-foreground">
            {value}
          </span>
          <span className="text-sm text-muted-foreground ml-1">ta</span>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const { data: animals = [], isLoading, isError } = useGetAnimals();

  const [filter, setFilter] = useState<FilterType>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [removeAnimal, setRemoveAnimal] = useState<Animal | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [deleteAnimal, setDeleteAnimal] = useState<Animal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const stats = useMemo(() => {
    const total = animals.length;
    const active = animals.filter((a) => !a.removedDate).length;
    const removed = animals.filter((a) => !!a.removedDate).length;
    return { total, active, removed };
  }, [animals]);

  const filtered = useMemo(() => {
    if (filter === "active") return animals.filter((a) => !a.removedDate);
    if (filter === "removed") return animals.filter((a) => !!a.removedDate);
    return animals;
  }, [animals, filter]);

  function handleEdit(animal: Animal) {
    setEditAnimal(animal);
    setEditOpen(true);
  }

  function handleRemove(animal: Animal) {
    setRemoveAnimal(animal);
    setRemoveOpen(true);
  }

  function handleDelete(animal: Animal) {
    setDeleteAnimal(animal);
    setDeleteOpen(true);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground tracking-tight">
              Ferma Hayvonlari
            </h1>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            data-ocid="animal.add_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Hayvon qo'shish</span>
            <span className="sm:hidden">Qo'shish</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Jami hayvonlar"
            value={stats.total}
            icon={<Hash className="h-4 w-4" />}
            colorClass="border-border"
            dataOcid="stats.total_card"
          />
          <StatsCard
            title="Fermada"
            value={stats.active}
            icon={<span className="text-base">🌿</span>}
            colorClass="border-green-300 bg-green-50/50"
            dataOcid="stats.active_card"
          />
          <StatsCard
            title="Olib ketilgan"
            value={stats.removed}
            icon={<LogOut className="h-4 w-4 text-stone-500" />}
            colorClass="border-stone-300 bg-stone-50/50"
            dataOcid="stats.removed_card"
          />
        </section>

        {/* Filter tabs */}
        <section className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {(
            [
              { key: "all", label: "Barchasi", count: stats.total },
              { key: "active", label: "Fermada", count: stats.active },
              { key: "removed", label: "Olib ketilgan", count: stats.removed },
            ] as { key: FilterType; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              data-ocid="nav.filter.tab"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                filter === key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {label}
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </section>

        {/* Table */}
        <section className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3"
              data-ocid="animal.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">
                Yuklanmoqda...
              </p>
            </div>
          ) : isError ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3"
              data-ocid="animal.error_state"
            >
              <span className="text-4xl">⚠️</span>
              <p className="text-destructive font-medium">
                Ma'lumotlarni yuklashda xatolik
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="animal.table">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        Raqam
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Turi
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Tug'ilgan sana
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <ChevronDown className="h-3.5 w-3.5" />
                        Necha kun
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Olib ketilgan
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Holat
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-right">
                      Amallar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-16"
                          data-ocid="animal.empty_state"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-5xl">🐾</span>
                            <p className="text-muted-foreground font-medium">
                              Hayvonlar topilmadi
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAddOpen(true)}
                              className="mt-1"
                            >
                              <Plus className="h-4 w-4 mr-1.5" />
                              Hayvon qo'shish
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((animal, idx) => {
                        const isRemoved = !!animal.removedDate;
                        const ageDiff = getDaysDiff(
                          animal.birthDate,
                          animal.removedDate,
                        );
                        const ocidIdx = idx + 1;
                        return (
                          <motion.tr
                            key={animal.id.toString()}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                            data-ocid={`animal.item.${ocidIdx}`}
                            className={`border-b border-border/60 hover:bg-muted/30 transition-colors ${
                              isRemoved ? "opacity-70" : ""
                            }`}
                          >
                            <TableCell className="font-mono font-semibold text-foreground">
                              {animal.number}
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5">
                                <span>{getAnimalEmoji(animal.animalType)}</span>
                                <span className="text-sm">
                                  {animal.animalType}
                                </span>
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {formatDate(animal.birthDate)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                                  isRemoved
                                    ? "bg-stone-100 text-stone-600"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {ageDiff.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {animal.removedDate
                                ? formatDate(animal.removedDate)
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  isRemoved
                                    ? "border-stone-300 bg-stone-100 text-stone-600"
                                    : "border-green-300 bg-green-100 text-green-800"
                                }
                              >
                                {isRemoved ? "Olib ketilgan" : "Fermada"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(animal)}
                                  data-ocid={`animal.edit_button.${ocidIdx}`}
                                  title="Tahrirlash"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {!isRemoved && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(animal)}
                                    data-ocid={`animal.remove_button.${ocidIdx}`}
                                    title="Olib ketildi"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  >
                                    <LogOut className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(animal)}
                                  data-ocid={`animal.delete_button.${ocidIdx}`}
                                  title="O'chirish"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {/* Info footer */}
        {!isLoading && !isError && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filtered.length} ta hayvon ko'rsatilmoqda
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {currentYear}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Dialogs */}
      <AnimalFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <AnimalFormDialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditAnimal(null);
        }}
        editAnimal={editAnimal}
      />
      <RemoveDateDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        animal={removeAnimal}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        animal={deleteAnimal}
      />
    </div>
  );
}
