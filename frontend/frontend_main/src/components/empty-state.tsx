
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddNew: () => void;
  searchQuery?: string;
}

export function EmptyState({ onAddNew, searchQuery }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4 animate-fade-in">
      <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-3xl">🔒</span>
      </div>
      
      {searchQuery ? (
        <>
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            No credentials match your search "{searchQuery}". Try searching with a different term.
          </p>
          <Button variant="outline" onClick={() => onAddNew()}>
            Add New Credential
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-medium mb-2">No credentials yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't added any credentials to your password manager yet. Get started by adding your first credential.
          </p>
          <Button onClick={() => onAddNew()}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Your First Credential
          </Button>
        </>
      )}
    </div>
  );
}
