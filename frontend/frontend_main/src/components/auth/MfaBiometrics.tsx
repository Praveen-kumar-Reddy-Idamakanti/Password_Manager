
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FingerprintIcon, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface MfaBiometricsProps {
  onComplete: () => void;
}

const MfaBiometrics = ({ onComplete }: MfaBiometricsProps) => {
  const { setupBiometrics, completeMfaStep } = useAuth();
  const [isSupported, setIsSupported] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if browser supports WebAuthn
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
    }
  }, []);

  const handleVerifyBiometrics = async () => {
    setIsVerifying(true);
    try {
      const result = await setupBiometrics();
      if (result) {
        setIsVerified(true);
        completeMfaStep("biometrics");
        toast.success("Biometric verification successful");
        onComplete();
      } else {
        toast.error("Biometric verification failed");
      }
    } catch (error) {
      toast.error("Biometric verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biometric Verification</CardTitle>
          <CardDescription>Your browser doesn't support biometric authentication</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-6">
          <XCircle className="h-16 w-16 text-destructive" />
        </CardContent>
        <CardFooter>
          <Button onClick={onComplete} className="w-full">
            Continue without biometrics
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biometric Verification</CardTitle>
        <CardDescription>
          Use your device's biometric sensor to verify your identity
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
        {isVerified ? (
          <CheckCircle className="h-16 w-16 text-primary" />
        ) : (
          <div 
            className="p-6 bg-muted rounded-full cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={!isVerifying ? handleVerifyBiometrics : undefined}
          >
            <FingerprintIcon className="h-12 w-12 text-primary" />
          </div>
        )}
        <Label className="mt-2 text-center">{
          isVerified 
            ? "Verification successful" 
            : "Tap the fingerprint icon to start verification"
        }</Label>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={isVerified ? onComplete : handleVerifyBiometrics} 
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : isVerified ? "Continue" : "Verify Biometrics"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MfaBiometrics;
