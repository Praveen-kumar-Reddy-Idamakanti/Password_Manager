
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { RefreshCw, Key, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const getStrengthScore = (pwd: string): number => {
    let score = 0;
    
    // Length check
    if (pwd.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(pwd)) score += 1; // Has uppercase
    if (/[a-z]/.test(pwd)) score += 1; // Has lowercase
    if (/[0-9]/.test(pwd)) score += 1; // Has numbers
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1; // Has special chars
    
    return score;
  };
  
  const score = getStrengthScore(password);
  
  const getLabel = () => {
    if (score === 0) return "Very Weak";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Moderate";
    if (score <= 4) return "Strong";
    return "Very Strong";
  };
  
  const getColor = () => {
    if (score === 0) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span>{getLabel()}</span>
        <span className="text-muted-foreground">{score}/5</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getColor()}`} 
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

export function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    let charset = "";
    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;
    
    // Default to lowercase if nothing is selected
    if (charset === "") charset = lowercase;
    
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    
    setPassword(newPassword);
  };
  
  // Generate a password when component mounts or when options change
  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Password Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="relative flex items-center">
          <div className="relative flex-1 mr-2 bg-background rounded-md border overflow-hidden">
            <div className="px-3 py-2 font-mono text-base break-all">{password}</div>
          </div>
          <div className="flex gap-1">
            <CopyButton value={password} />
            <Button variant="outline" size="icon" onClick={generatePassword}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <PasswordStrengthIndicator password={password} />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Password Length: {length}</Label>
            </div>
            <Slider
              value={[length]}
              min={8}
              max={32}
              step={1}
              onValueChange={(value) => setLength(value[0])}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="uppercase">Include Uppercase</Label>
              </div>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="lowercase">Include Lowercase</Label>
              </div>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="numbers">Include Numbers</Label>
              </div>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="symbols">Include Symbols</Label>
              </div>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 p-3">
        <div className="flex items-center text-xs text-muted-foreground w-full justify-center gap-1">
          <Shield className="h-3 w-3" />
          <span>Generated locally - never stored or transmitted</span>
          <Zap className="h-3 w-3" />
        </div>
      </CardFooter>
    </Card>
  );
}
