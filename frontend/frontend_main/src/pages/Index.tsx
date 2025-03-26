
import { useState, useEffect } from "react";
import { 
  getStoredCredentials, 
  addCredential, 
  updateCredential, 
  deleteCredential 
} from "@/lib/storage";
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
  const [editingCredential, setEditingCredential] = useState<Credential | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);

  // Load credentials on mount
  useEffect(() => {
    const storedCredentials = getStoredCredentials();
    setCredentials(storedCredentials);
    setFilteredCredentials(storedCredentials);
  }, []);

  // Filter credentials when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCredentials(credentials);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = credentials.filter(
      (cred) =>
        cred.title.toLowerCase().includes(query) ||
        cred.username.toLowerCase().includes(query) ||
        (cred.url && cred.url.toLowerCase().includes(query))
    );
    
    setFilteredCredentials(filtered);
  }, [searchQuery, credentials]);

  // Handle adding a new credential
  const handleAddCredential = (data: Omit<Credential, "id" | "createdAt" | "updatedAt">) => {
    if (editingCredential) {
      // Update existing credential
      const updated = {
        ...editingCredential,
        ...data,
      };
      
      updateCredential(updated);
      setCredentials((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      
      toast.success("Credential updated successfully");
    } else {
      // Add new credential
      const newCredential = addCredential(data);
      setCredentials((prev) => [...prev, newCredential]);
      toast.success("New credential added");
    }
    
    setEditingCredential(undefined);
  };

  // Open the edit dialog
  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setDialogOpen(true);
  };

  // Open the delete confirmation dialog
  const handleDeleteConfirm = (id: string) => {
    setCredentialToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Delete the credential
  const handleDelete = () => {
    if (credentialToDelete) {
      deleteCredential(credentialToDelete);
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
          setEditingCredential(undefined);
          setDialogOpen(true);
        }}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {filteredCredentials.length === 0 ? (
          <EmptyState 
            onAddNew={() => {
              setEditingCredential(undefined);
              setDialogOpen(true);
            }}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Add/Edit Credential Dialog */}
      <AddCredentialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCredential}
        onSave={handleAddCredential}
      />
      
      {/* Delete Confirmation Dialog */}
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
