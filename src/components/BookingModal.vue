<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal__header">
            <div>
              <h2 class="modal__title">{{ mode === 'view' ? booking?.name : 'New appointment' }}</h2>
              <p class="modal__sub">{{ slotLabel }}</p>
            </div>
            <button class="modal__close" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- VIEW MODE -->
          <div v-if="mode === 'view'" class="modal__body">
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">Mobile</span>
                <a :href="`tel:${booking.mobile}`" class="detail-value detail-value--link">{{ booking.mobile }}</a>
              </div>
              <div class="detail-row">
                <span class="detail-label">Services</span>
                <span class="detail-value">{{ booking.services }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Chair</span>
                <span class="detail-value">{{ chairLabel }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">{{ time }}</span>
              </div>
              <div class="detail-row" v-if="booking.notes">
                <span class="detail-label">Notes</span>
                <span class="detail-value">{{ booking.notes }}</span>
              </div>
            </div>

            <div class="modal__actions">
              <button class="btn btn--whatsapp" @click="sendReminder">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send reminder now
              </button>
              <button class="btn btn--danger" @click="$emit('delete')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Delete
              </button>
              <button class="btn btn--secondary" @click="$emit('close')">Close</button>
            </div>
          </div>

          <!-- BOOK MODE -->
          <div v-else class="modal__body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Customer name <span class="required">*</span></label>
                <input
                  ref="nameInput"
                  v-model="form.name"
                  class="form-input"
                  :class="{ 'form-input--error': errors.name }"
                  placeholder="Enter full name"
                  @input="errors.name = ''"
                />
                <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile number <span class="required">*</span></label>
                <input
                  v-model="form.mobile"
                  class="form-input"
                  :class="{ 'form-input--error': errors.mobile }"
                  placeholder="10-digit number"
                  inputmode="numeric"
                  maxlength="15"
                  @input="errors.mobile = ''"
                />
                <span v-if="errors.mobile" class="form-error">{{ errors.mobile }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Services <span class="required">*</span></label>
              <div class="services-grid">
                <button
                  v-for="svc in availableServices"
                  :key="svc"
                  type="button"
                  class="service-tag"
                  :class="{ 'service-tag--selected': form.services.includes(svc) }"
                  @click="toggleService(svc)"
                >{{ svc }}</button>
              </div>
              <span v-if="errors.services" class="form-error">{{ errors.services }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Notes (optional)</label>
              <input v-model="form.notes" class="form-input" placeholder="Any special requests..." />
            </div>

            <!-- WhatsApp reminder toggle -->
            <div class="reminder-toggle">
              <div class="toggle-info">
                <div class="toggle-title">Schedule WhatsApp reminder</div>
                <div class="toggle-sub">Auto-send reminder 15 min before appointment</div>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="form.scheduleReminder" />
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="modal__actions">
              <button class="btn btn--secondary" @click="$emit('close')">Cancel</button>
              <button class="btn btn--primary" :disabled="isSaving" @click="submit">
                <svg v-if="isSaving" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ isSaving ? 'Booking...' : 'Confirm booking' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { HAIR_SERVICES, BEAUTY_SERVICES } from '@/composables/useBookings'
import { useWhatsApp } from '@/composables/useWhatsApp'

const props = defineProps({
  show: Boolean,
  mode: { type: String, default: 'book' }, // 'book' | 'view'
  time: String,
  chairId: String,
  chairLabel: String,
  chairType: String,
  date: [Date, Object],
  booking: Object,
  isSaving: Boolean,
})

const emit = defineEmits(['close', 'submit', 'delete'])

const { sendReminder: wpReminder } = useWhatsApp()

const nameInput = ref(null)
const form = ref({ name: '', mobile: '', services: [], notes: '', scheduleReminder: true })
const errors = ref({ name: '', mobile: '', services: '' })

const availableServices = computed(() =>
  props.chairType === 'hair' ? HAIR_SERVICES : BEAUTY_SERVICES
)

const slotLabel = computed(() => {
  if (!props.time) return ''
  const dateStr = props.date
    ? new Date(props.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
  return `${props.time} · ${props.chairLabel} · ${dateStr}`
})

watch(() => props.show, async (val) => {
  if (val && props.mode === 'book') {
    form.value = { name: '', mobile: '', services: [], notes: '', scheduleReminder: true }
    errors.value = { name: '', mobile: '', services: '' }
    await nextTick()
    nameInput.value?.focus()
  }
})

function toggleService(svc) {
  const idx = form.value.services.indexOf(svc)
  if (idx >= 0) form.value.services.splice(idx, 1)
  else form.value.services.push(svc)
  errors.value.services = ''
}

function validate() {
  let ok = true
  if (!form.value.name.trim()) { errors.value.name = 'Name is required'; ok = false }
  if (!/^\d{7,15}$/.test(form.value.mobile.trim())) { errors.value.mobile = 'Enter a valid mobile number'; ok = false }
  if (form.value.services.length === 0) { errors.value.services = 'Select at least one service'; ok = false }
  return ok
}

function submit() {
  if (!validate()) return
  emit('submit', {
    name: form.value.name.trim().toUpperCase(),
    mobile: form.value.mobile.trim(),
    services: form.value.services.join(', '),
    notes: form.value.notes.trim(),
    scheduleReminder: form.value.scheduleReminder,
    chairType: props.chairType,
  })
}

function sendReminder() {
  wpReminder(props.booking, props.time, props.chairLabel)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(10, 8, 6, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  width: 520px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.modal__header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 24px 24px 0;
}
.modal__title { font-family: var(--font-display); font-size: 18px; font-weight: 500; }
.modal__sub { font-size: 12px; color: var(--color-text-muted); margin-top: 3px; }
.modal__close {
  width: 32px; height: 32px;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: none; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background var(--transition);
}
.modal__close:hover { background: var(--color-surface-2); }
.modal__body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal__actions { display: flex; gap: 10px; margin-top: 4px; justify-content: flex-end; }

/* form */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 500; color: var(--color-text-muted); }
.required { color: var(--color-danger); }
.form-input {
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.form-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(139,111,71,0.12); }
.form-input--error { border-color: var(--color-danger); }
.form-error { font-size: 11px; color: var(--color-danger); }

/* services */
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; }
.service-tag {
  padding: 7px 10px; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 12px; background: none;
  color: var(--color-text-muted); cursor: pointer; text-align: center;
  transition: all var(--transition);
}
.service-tag:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-light); }
.service-tag--selected { border-color: var(--color-accent); background: var(--color-accent-light); color: var(--color-accent); font-weight: 500; }

/* reminder toggle */
.reminder-toggle {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.toggle-title { font-size: 13px; font-weight: 500; }
.toggle-sub { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
.switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: absolute; inset: 0; cursor: pointer;
  background: var(--color-border); border-radius: 99px;
  transition: background 0.2s;
}
.switch-slider::before {
  content: ''; position: absolute;
  width: 18px; height: 18px; border-radius: 50%;
  background: white; left: 3px; bottom: 3px;
  transition: transform 0.2s;
  box-shadow: var(--shadow-sm);
}
.switch input:checked + .switch-slider { background: var(--color-accent); }
.switch input:checked + .switch-slider::before { transform: translateX(20px); }

/* buttons */
.btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 400; border: 1px solid var(--color-border);
  cursor: pointer; background: none; color: var(--color-text);
  transition: background var(--transition);
}
.btn:hover { background: var(--color-surface-2); }
.btn--primary { background: var(--color-accent); color: white; border-color: var(--color-accent); }
.btn--primary:hover { background: var(--color-accent-hover); }
.btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--secondary { color: var(--color-text-muted); }
.btn--danger { color: var(--color-danger); border-color: var(--color-danger); }
.btn--danger:hover { background: var(--color-danger-light); }
.btn--whatsapp { background: #25D366; color: white; border-color: #25D366; }
.btn--whatsapp:hover { background: #1da855; }

/* detail view */
.detail-grid { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: grid; grid-template-columns: 80px 1fr; gap: 10px; align-items: start; }
.detail-label { font-size: 12px; color: var(--color-text-muted); padding-top: 1px; }
.detail-value { font-size: 13px; color: var(--color-text); }
.detail-value--link { color: var(--color-accent); text-decoration: none; }

/* spin */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

/* modal transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97) translateY(8px); }
</style>
