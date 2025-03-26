
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyButtonProps {
  value: string;
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({ value, className, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      
      if (onCopy) {
        onCopy();
      }
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-8 w-8 transition-all", 
        copied ? "text-green-500" : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleCopy}
    >
      <span className="sr-only">Copy</span>
      {copied ? (
        <Check className="h-4 w-4 animate-fade-in" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
