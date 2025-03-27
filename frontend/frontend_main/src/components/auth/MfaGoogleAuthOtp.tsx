
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface MfaGoogleAuthProps {
  onComplete: () => void;
}

const MfaGoogleAuthOtp = ({ onComplete }: MfaGoogleAuthProps) => {
  const { validateOtp, completeMfaStep } = useAuth();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const { user } = useAuth(); // Assuming user object contains email
  
  if (!user?.email) {
    toast.error("User email not found");
    return;
  }
  const fetchQrCode = async () => {
    const response = await fetch("http://localhost:5000/auth/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email:user.email }),
    });
    const data = await response.json();
    if (data.qrCodeUrl){
      setQrCodeDataUrl(data.qrCodeUrl);
      setShowQrCode(true);
    }
    else{
      toast.error("Failed to generate QR Code");
    }
    
  };
  
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    console.log("I am heere");
  
    setIsVerifying(true);
    try {
      console.log("Iam here before verify from backend")

      const response = await fetch("http://localhost:5000/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "app@email.com", token: otp }),
      });
      console.log("Iam here afteer verify from backend")
      const data = await response.json();
      if (data.success) {
        completeMfaStep("googleAuth");
        toast.success("OTP verification successful");
        onComplete();
      } else {
        toast.error("Invalid OTP code");
      }
    } catch (error) {
      toast.error("OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Authenticator</CardTitle>
        <CardDescription>
          Set up Google Authenticator for additional security
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        

        <div className="w-full space-y-2 mt-4">
          <Label htmlFor="otp">Enter the 6-digit code from your authenticator app:</Label>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerifyOtp} 
          disabled={otp.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MfaGoogleAuthOtp;
