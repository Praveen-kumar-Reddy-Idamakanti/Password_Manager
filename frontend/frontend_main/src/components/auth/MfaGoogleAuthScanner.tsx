
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QrCodeIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface MfaGoogleAuthProps {
  onComplete: () => void;
}

const MfaGoogleAuthScanner = ({ onComplete }: MfaGoogleAuthProps) => {
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
  
    setIsVerifying(true);
    try {
      console.log(user.email);
        const response = await fetch("http://localhost:5000/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email:user.email, token: otp }),
      });

      const data = await response.json();
      console.log("OTP Verification Response:", data);  // Log response for debugging
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
        {showQrCode ? (
          <>
            <div className="border p-2 bg-white rounded-md">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code for Google Authenticator" 
                className="w-48 h-48"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Scan this QR code with Google Authenticator app</p>
              <p className="font-mono mt-2">JBSWY3DPEHPK3PXP</p>
            </div>
          </>
        ) : (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 w-full"
            onClick={async () =>{
              await fetchQrCode();
              setShowQrCode(true);
            }}
          >
            <QrCodeIcon className="h-5 w-5" />
            Show QR Code
          </Button>
        )}

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

export default MfaGoogleAuthScanner;
