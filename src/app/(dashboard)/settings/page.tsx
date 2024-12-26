'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth";
import { FireAuth } from "@/firebase/firebase";
import { useToast } from "@/components/ui/use-toast"
import { UserAuth } from "@/contexts/AuthContext";
import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function SettingsPage() {

  const {user} = UserAuth();

  useEffect(() => {
    if (!user) {
      redirect('/login')
    }
  }, [user])



  const { toast } = useToast()

  const handleLogout = () => {
    signOut(FireAuth).then(() => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    }).catch((error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    });
    
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Language Preferences</p>
          <p>Notification Settings</p>
          <p>Accessibility Options</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Data Sharing Preferences</p>
          <p>Account Visibility</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

