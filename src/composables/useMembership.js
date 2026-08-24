// composables/useMembership.js
import { ref } from 'vue'
import { API_URL } from '@/config'

export { API_URL }

export function useMembership() {
  const plans         = ref([])
  const memberships   = ref([])
  const usageHistory  = ref([])

  const isLoading = ref(false)
  const isSaving  = ref(false)
  const error     = ref('')

  // ── PLANS ──
  // Only the active-only call (the common case, used by the plan picker) updates the
  // shared `plans` ref. The includeInactive call is used for admin listings, which read
  // the returned data directly instead — keeping the two from clobbering each other.
  async function fetchPlans(includeInactive = false) {
    isLoading.value = true
    error.value     = ''
    try {
      const url  = includeInactive ? `${API_URL}?action=membershipPlansGet&all=true` : `${API_URL}?action=membershipPlansGet`
      const res  = await fetch(url)
      const data = await res.json()
      if (!includeInactive) plans.value = data.plans || []
      return data
    } catch (err) {
      console.error('fetchPlans error:', err)
      error.value = 'Failed to load membership plans.'
      return { success: false, plans: [] }
    } finally {
      isLoading.value = false
    }
  }

  async function savePlan(payload) {
    isSaving.value = true
    error.value    = ''
    try {
      const params = new URLSearchParams({ action: 'membershipPlanSave', ...payload })
      const res    = await fetch(`${API_URL}?${params}`)
      return await res.json()
    } catch (err) {
      console.error('savePlan error:', err)
      error.value = 'Failed to save plan.'
      return { success: false, error: 'Network error' }
    } finally {
      isSaving.value = false
    }
  }

  async function deletePlan(id) {
    try {
      const res  = await fetch(`${API_URL}?action=membershipPlanDelete&id=${encodeURIComponent(id)}`)
      return await res.json()
    } catch (err) {
      console.error('deletePlan error:', err)
      return { success: false, error: 'Network error' }
    }
  }

  // ── MEMBERSHIP ──
  async function saveMembership(payload) {
    isSaving.value = true
    error.value    = ''
    try {
      const params = new URLSearchParams({ action: 'membershipSave', ...payload })
      const res    = await fetch(`${API_URL}?${params}`)
      return await res.json()
    } catch (err) {
      console.error('saveMembership error:', err)
      error.value = 'Failed to save membership.'
      return { success: false, error: 'Network error' }
    } finally {
      isSaving.value = false
    }
  }

  async function fetchMembershipById(id) {
    isLoading.value = true
    error.value     = ''
    try {
      const res  = await fetch(`${API_URL}?action=membershipGet&id=${encodeURIComponent(id)}`)
      const data = await res.json()
      memberships.value = data.memberships || []
      return data
    } catch (err) {
      console.error('fetchMembershipById error:', err)
      error.value = 'Failed to load membership.'
      return { success: false, memberships: [] }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMembershipsByPhone(phone) {
    isLoading.value = true
    error.value     = ''
    try {
      const res  = await fetch(`${API_URL}?action=membershipGet&phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      memberships.value = data.memberships || []
      return data
    } catch (err) {
      console.error('fetchMembershipsByPhone error:', err)
      error.value = 'Failed to load membership.'
      return { success: false, memberships: [] }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMembershipList(search = '') {
    isLoading.value = true
    error.value     = ''
    try {
      const params = new URLSearchParams({ action: 'membershipListGet' })
      if (search) params.set('search', search)
      const res  = await fetch(`${API_URL}?${params}`)
      const data = await res.json()
      memberships.value = data.memberships || []
      return data
    } catch (err) {
      console.error('fetchMembershipList error:', err)
      error.value = 'Failed to load memberships.'
      return { success: false, memberships: [] }
    } finally {
      isLoading.value = false
    }
  }

  // ── SERVICE USAGE ──
  async function fetchUsageHistory(membershipId) {
    isLoading.value = true
    error.value     = ''
    try {
      const res  = await fetch(`${API_URL}?action=membershipUsageGet&membershipId=${encodeURIComponent(membershipId)}`)
      const data = await res.json()
      usageHistory.value = data.usage || []
      return data
    } catch (err) {
      console.error('fetchUsageHistory error:', err)
      error.value = 'Failed to load service history.'
      return { success: false, usage: [] }
    } finally {
      isLoading.value = false
    }
  }

  async function recordUsage(payload) {
    isSaving.value = true
    error.value    = ''
    try {
      const params = new URLSearchParams({ action: 'membershipUsageSave', ...payload })
      const res    = await fetch(`${API_URL}?${params}`)
      return await res.json()
    } catch (err) {
      console.error('recordUsage error:', err)
      error.value = 'Failed to record service.'
      return { success: false, error: 'Network error' }
    } finally {
      isSaving.value = false
    }
  }

  return {
    plans,
    memberships,
    usageHistory,
    isLoading,
    isSaving,
    error,
    fetchPlans,
    savePlan,
    deletePlan,
    saveMembership,
    fetchMembershipById,
    fetchMembershipsByPhone,
    fetchMembershipList,
    fetchUsageHistory,
    recordUsage
  }
}
