import { create } from 'zustand'

interface User {
  id: string
  line_user_id: string
  ragic_id: number
  ragic_member_id: string | null
  locale: string | null
  avg_cycle_days: number | null
  avg_period_days: number | null
  luteal_phase_days: number | null
  phone?: string
  next_period_date?: string
  is_bound: boolean
  created_at?: string | null
}

interface UserStore {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUserFields: (fields: Partial<User>) => void
  reset: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateUserFields: (fields) => {
    const { user } = get()
    if (user) {
      set({ user: { ...user, ...fields } })
    }
  },

  reset: () => set({
    user: null,
    isLoading: false,
    error: null
  })
}))
