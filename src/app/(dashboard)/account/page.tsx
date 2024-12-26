'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAuth } from '@/contexts/AuthContext'



export default function AccountPage() {
  const user = UserAuth().user

  if (!user) {
    return <div>Loading user data...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: {user.displayName}</p>
          <p>Email: {user.email}</p>
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

