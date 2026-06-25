'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { auth, onAuthStateChange, db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)

      // 🔥 FIX: Ensure Firestore user document exists
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid)

          await setDoc(
            userRef,
            {
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              lastLogin: serverTimestamp(),
              createdAt: serverTimestamp(),
              userHistory: [], // REQUIRED for your app
            },
            { merge: true }
          )
        } catch (error) {
          console.error('Failed to create/update user document:', error)
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
