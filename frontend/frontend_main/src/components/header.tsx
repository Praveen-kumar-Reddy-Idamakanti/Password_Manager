
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, KeyRound, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AddCredentialDialog } from "./add-credential-dialog";
import { Input } from "@/components/ui/input";
import { Credential } from "@/lib/types";
import { addCredential } from "@/lib/storage";
import { toast } from "sonner";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: React.SetStateAction<string>) => void;
  onAddNew?: () => void;
}

export function Header({ searchQuery, onSearchChange, onAddNew }: HeaderProps = {}) {
  const { logout, user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddCredential = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      setIsAddDialogOpen(true);
    }
  };
  
  const handleSaveCredential = (credential: Omit<Credential, "id" | "createdAt" | "updatedAt">) => {
    addCredential(credential);
    toast.success("New credential added");
  };

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-6 w-6" />
          <h1 className="text-xl font-bold md:text-2xl">Password Vault</h1>
        </div>
        
        {user && onSearchChange && (
          <div className="hidden mx-4 flex-1 max-w-md md:flex relative">
            <Input
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleAddCredential}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Add Credential</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
              {!onAddNew && (
                <AddCredentialDialog 
                  open={isAddDialogOpen} 
                  onOpenChange={setIsAddDialogOpen}
                  onSave={handleSaveCredential}
                />
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
