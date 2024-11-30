"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {standardAuthenticationProtection} from "@/hooks/page-protection"
import { useEffect } from "react"
import {redirect} from "next/navigation"
import { UserAuth } from "@/contexts/AuthContext";


export default function AccountPage() {

  const {user} = UserAuth();

  useEffect(() => {
    if (!user) {
      redirect('/login')
    }
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: John Doe</p>
          <p>Email: john.doe@example.com</p>
          <p>Student ID: 12345678</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Change Password</p>
          <p>Update Contact Information</p>
          <p>Manage Notifications</p>
        </CardContent>
      </Card>
    </div>
  )
}

