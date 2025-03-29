import { useState, useEffect } from "react";
import { 
  getStoredCredentials, 
  addCredential, 
  updateCredential, 
  deleteCredential 
} from "../lib/storage";
import { Credential } from "@/lib/types";
import { Header } from "@/components/header";
import { CredentialCard } from "@/components/credential-card";
import { AddCredentialDialog } from "@/components/add-credential-dialog";
import { EmptyState } from "@/components/empty-state";
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
import { toast } from "sonner";

const Index = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const token = localStorage.getItem("token"); // Ensure token is available

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/credentials", {
          method: "GET",
          credentials: "include", // ✅ Ensures cookies are sent with the request
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to fetch credentials");
        }
    
        const storedCredentials = await response.json();
        console.log(storedCredentials)
        setCredentials(storedCredentials);
        setFilteredCredentials(storedCredentials);
      } catch (error) {
        console.log("Error fetching credentials:", error);
      }
    };
    
    fetchCredentials();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCredentials(credentials);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredCredentials(credentials.filter(
      (cred) =>
        cred.title.toLowerCase().includes(query) ||
        cred.username.toLowerCase().includes(query) ||
        (cred.url && cred.url.toLowerCase().includes(query))
    ));
  }, [searchQuery, credentials]);

  const handleSaveCredential = async (data: Omit<Credential, "id" | "createdAt" | "updatedAt">) => {
    if (editingCredential) {
      const updatedCredential = { ...editingCredential, ...data };
      await updateCredential(updatedCredential,token);
      setCredentials((prev) => prev.map((c) => (c.id === updatedCredential.id ? updatedCredential : c)));
      toast.success("Credential updated successfully");
    } else {
      const newCredential = await addCredential(data,token);
      setCredentials((prev) => [...prev, newCredential]);
      toast.success("New credential added");
    }
    setEditingCredential(null);
    setDialogOpen(false);
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setCredentialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (credentialToDelete) {
      await deleteCredential(credentialToDelete,token);
      setCredentials((prev) => prev.filter((c) => c.id !== credentialToDelete));
      toast.success("Credential deleted");
      setCredentialToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={() => {
          setEditingCredential(null);
          setDialogOpen(true);
        }}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {filteredCredentials.length === 0 ? (
          <EmptyState 
            onAddNew={() => {
              setEditingCredential(null);
              setDialogOpen(true);
            }}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id||credential.title}
                credential={credential}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
              />
            ))}
          </div>
        )}
      </main>
      
      <AddCredentialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCredential}
        onSave={handleSaveCredential}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this credential from your password manager.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
