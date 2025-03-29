
import { useState } from "react";
import { Credential } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Eye, EyeOff, ExternalLink, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface CredentialCardProps {
  credential: Credential;
  onEdit: (credential: Credential) => void;
  onDelete: (id: string) => void;
}

export function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const getCategoryIcon = () => {
    switch (credential.category) {
      case 'email':
        return '📧';
      case 'entertainment':
        return '🎬';
      case 'development':
        return '💻';
      case 'social':
        return '👥';
      case 'finance':
        return '💰';
      default:
        return '🔒';
    }
  };
  
  const handleOpenWebsite = () => {
    if (!credential.url) return;
    
    let url = credential.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    window.open(url, '_blank');
  };

  return (
    <Card className="password-card overflow-hidden transition-all">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <span className="text-lg" aria-hidden="true">
            {getCategoryIcon()}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-lg truncate">{credential.title}</h3>
          {credential.url && (
            <p className="text-sm text-muted-foreground truncate">{credential.url}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-0 space-y-2">
        <div className="space-y-1">
          <div className="text-sm font-medium">Username</div>
          <div className="flex items-center group relative px-3 py-2 rounded-md bg-muted/50">
            <span className="text-sm truncate flex-1">{credential.username}</span>
            <CopyButton value={credential.username} className="opacity-0 group-hover:opacity-100" />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-medium">Password</div>
          <div className="flex items-center group relative px-3 py-2 rounded-md bg-muted/50">
          <span className={cn(
            "text-sm truncate flex-1",
            !showPassword && "password-input"
          )}>
            {credential.password
              ? showPassword
                ? credential.password
                : "•".repeat(Math.min(credential.password.length||0, 12))
              : "N/A"}
          </span>

            <div className="flex opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="sr-only">
                  {showPassword ? "Hide Password" : "Show Password"}
                </span>
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <CopyButton value={credential.password} />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-3 flex justify-between mt-2">
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => onEdit(credential)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => onDelete(credential.id)}>
            <Trash className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
        
        {credential.url && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-primary"
            onClick={handleOpenWebsite}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Visit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
