'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { userApi } from '@/app/lib/client-api/users'
import { IUser } from '@@/models/User'
import { useToast } from "@/components/ui/use-toast"

export default function AccountPage() {
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // For this example, we'll use a hardcoded user ID.
        // In a real application, you'd get this from an auth context or similar.
        const userId = '1'
        const response = await userApi.getUserById(userId)
        if (response.data) {
          setUser(response.data)
        } else {
          throw new Error(response.error?.error || 'Failed to fetch user data')
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  if (loading) {
    return <div>Loading user data...</div>
  }

  if (!user) {
    return <div>Failed to load user data. Please try again later.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Student ID: {user._id}</p>
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

