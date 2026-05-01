import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) fetchProfile(session.user.id)
      else setState(prev => ({ ...prev, loading: false }))
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) fetchProfile(session.user.id)
      else setState(prev => ({ ...prev, profile: null, loading: false }))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setState(prev => ({ ...prev, profile: data ?? null, loading: false }))
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string, skinTone: string, bodyType: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // Supabase returns empty identities array when email is already registered
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.')
    }

    // Create profile row
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        skin_tone: skinTone,
        body_type: bodyType,
      })
      if (profileError) throw profileError
    }

    // Sign out immediately so user must log in manually
    await supabase.auth.signOut()
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw new Error(error.message)
  }

  async function updateProfile(skinTone: string, bodyType: string) {
    if (!state.user) throw new Error('Not signed in')
    const { error } = await supabase
      .from('profiles')
      .update({ skin_tone: skinTone, body_type: bodyType })
      .eq('id', state.user.id)
    if (error) throw new Error(error.message)
    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, skin_tone: skinTone, body_type: bodyType } : null,
    }))
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
}
