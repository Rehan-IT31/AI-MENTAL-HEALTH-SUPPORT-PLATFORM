"use client"

import { useState } from "react"
import { deleteUser, signOut, updateProfile, updatePassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import AuthRequired from "@/components/auth-required"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success("Signed out successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return

    setIsDeleting(true)
    try {
      await deleteUser(auth.currentUser)
      toast.success("Account deleted successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account. You may need to re-authenticate first.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setIsUpdating(true)
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName || auth.currentUser.displayName,
        photoURL: photoURL || auth.currentUser.photoURL,
      })
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser || !newPassword) return

    setIsUpdating(true)
    try {
      await updatePassword(auth.currentUser, newPassword)
      toast.success("Password updated successfully!")
      setNewPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Failed to update password")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-20 px-4">
          <div className="mt-16 max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-gray-400 text-lg">
                Manage your profile and account preferences
              </p>
            </div>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl">Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-800/50 border-gray-700 text-gray-300 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-gray-300 font-medium">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={user?.displayName || "Enter display name"}
                      className="bg-gray-800/50 border-gray-700 text-white h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoURL" className="text-gray-300 font-medium">
                      Photo URL
                    </Label>
                    <Input
                      id="photoURL"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder={user?.photoURL || "Enter photo URL"}
                      className="bg-gray-800/50 border-gray-700 text-white h-12"
                    />
                  </div>

                  <Button type="submit" disabled={isUpdating} className="w-full h-12">
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm font-medium">Account ID</p>
                  <p className="text-white font-medium font-mono text-sm break-all">
                    {user?.uid}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
