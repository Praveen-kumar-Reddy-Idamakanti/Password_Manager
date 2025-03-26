
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Credential } from "@/lib/types";
import { Eye, EyeOff, Wand2 } from "lucide-react";
import { PasswordGenerator } from "@/components/password-generator";

interface AddCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Credential;
  onSave: (credential: Omit<Credential, "id" | "createdAt" | "updatedAt">) => void;
}

export function AddCredentialDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSave 
}: AddCredentialDialogProps) {
  const [formData, setFormData] = useState<Omit<Credential, "id" | "createdAt" | "updatedAt">>({
    title: "",
    username: "",
    password: "",
    url: "",
    category: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      // When editing, pre-fill the form
      setFormData({
        title: initialData.title,
        username: initialData.username,
        password: initialData.password,
        url: initialData.url || "",
        category: initialData.category || "",
      });
    } else {
      // When adding new, reset the form
      setFormData({
        title: "",
        username: "",
        password: "",
        url: "",
        category: "",
      });
    }
    // Reset password generator visibility when dialog opens/closes
    setShowPasswordGenerator(false);
  }, [initialData, open]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    if (!formData.title || !formData.username || !formData.password) {
      // Basic validation
      return;
    }
    
    onSave(formData);
    onOpenChange(false);
  };

  const handleUseGeneratedPassword = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setShowPasswordGenerator(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden animate-fade-in">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Credential" : "Add New Credential"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update your stored credential details." : "Add a new credential to your secure password manager."}
          </DialogDescription>
        </DialogHeader>
        
        {showPasswordGenerator ? (
          <div className="py-3">
            <PasswordGenerator />
            <div className="mt-4 flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordGenerator(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  handleUseGeneratedPassword(document.querySelector('.font-mono')?.textContent || "");
                }}
              >
                Use This Password
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-3">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Gmail, Netflix, etc."
                value={formData.title}
                onChange={handleChange}
                className="animate-slide-up"
                style={{animationDelay: '50ms'}}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Username or Email"
                value={formData.username}
                onChange={handleChange}
                className="animate-slide-up"
                style={{animationDelay: '100ms'}}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-20 animate-slide-up"
                  style={{animationDelay: '150ms'}}
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full px-2"
                    onClick={() => setShowPasswordGenerator(true)}
                    title="Generate Password"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL (Optional)</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleChange}
                className="animate-slide-up"
                style={{animationDelay: '200ms'}}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="animate-slide-up" style={{animationDelay: '250ms'}}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {!showPasswordGenerator && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {initialData ? "Save Changes" : "Add Credential"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
