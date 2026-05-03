<template>
  <div class="login-page">

    <!-- Animated background -->
    <div class="bg-layer">
      <div class="bg-orb bg-orb--1"></div>
      <div class="bg-orb bg-orb--2"></div>
      <div class="bg-orb bg-orb--3"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="login-card" :class="{ 'login-card--shake': shaking }">

      <!-- Brand -->
      <div class="brand">
        <div class="brand__logo">
          <img style="width: 55px; height: 55px;" src="/favicon.png" alt="Scintillate Salon" />

        </div>
        <div class="brand__text">
          <div class="brand__name">Scintillate</div>
          <div class="brand__sub">Unisex Salon — Staff Portal</div>
        </div>
      </div>

      <!-- Heading -->
      <div class="login-heading">
        <h1 class="login-title">Welcome back</h1>
        <p class="login-desc">Enter your passcode to continue</p>
      </div>

      <!-- Passcode input -->
      <div class="input-group" :class="{ 'input-group--error': error, 'input-group--success': success }">
        <label class="input-label">Passcode</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            ref="inputRef"
            v-model="passcode"
            :type="showPasscode ? 'text' : 'password'"
            class="passcode-input"
            placeholder="Enter passcode"
            autocomplete="current-password"
            maxlength="20"
            @keydown.enter="handleLogin"
            @input="error = ''"
          />
          <button type="button" class="toggle-btn" @click="showPasscode = !showPasscode" tabindex="-1">
            <svg v-if="!showPasscode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>

        <!-- PIN dots display -->
        <div class="pin-dots" v-if="passcode.length > 0 && !showPasscode">
          <span
            v-for="n in Math.min(passcode.length, 10)"
            :key="n"
            class="pin-dot"
            :class="{ 'pin-dot--filled': true }"
          ></span>
          <span v-if="passcode.length > 10" class="pin-more">+{{ passcode.length - 10 }}</span>
        </div>

        <transition name="err">
          <div v-if="error" class="error-msg">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>
        </transition>
      </div>

      <!-- Submit -->
      <button
        class="login-btn"
        :class="{ 'login-btn--loading': loading, 'login-btn--success': success }"
        @click="handleLogin"
        :disabled="loading || !passcode"
      >
        <span v-if="!loading && !success" class="login-btn__text">
          Unlock
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
        <span v-else-if="loading" class="login-btn__loader">
          <span class="dot-1"></span><span class="dot-2"></span><span class="dot-3"></span>
        </span>
        <span v-else class="login-btn__success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </button>

      <!-- Footer -->
      <div class="login-footer">
        <span class="login-footer__dot"></span>
        Session valid for 7 days
      </div>
    </div>

    <!-- Decorative side panel -->
    <div class="side-panel">
      <div class="side-panel__inner">
        <div class="side-quote">"Every client deserves the best version of themselves."</div>
        <div class="side-stats">
          <div class="stat">
            <div class="stat__num">4</div>
            <div class="stat__label">Specialists</div>
          </div>
          <div class="stat">
            <div class="stat__num">✦</div>
            <div class="stat__label">Premium</div>
          </div>
          <div class="stat">
            <div class="stat__num">∞</div>
            <div class="stat__label">Services</div>
          </div>
        </div>
        <div class="side-deco">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 10 C100 10 110 40 100 60 C90 80 70 85 70 100 C70 120 85 135 100 140 C100 140 80 155 80 175 C80 190 90 200 100 200" stroke="rgba(139,111,71,0.3)" stroke-width="1.5"/>
            <path d="M100 10 C100 10 90 40 100 60 C110 80 130 85 130 100 C130 120 115 135 100 140" stroke="rgba(139,111,71,0.3)" stroke-width="1.5"/>
            <circle cx="100" cy="100" r="60" stroke="rgba(139,111,71,0.08)" stroke-width="1"/>
            <circle cx="100" cy="100" r="90" stroke="rgba(139,111,71,0.05)" stroke-width="1"/>
          </svg>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '@/composables/useSession'

const router       = useRouter()
const { login }    = useSession()

const passcode     = ref('')
const showPasscode = ref(false)
const error        = ref('')
const loading      = ref(false)
const success      = ref(false)
const shaking      = ref(false)
const inputRef     = ref(null)

onMounted(() => inputRef.value?.focus())

async function handleLogin() {
  if (!passcode.value || loading.value) return
  error.value   = ''
  loading.value = true

  // Small artificial delay for UX polish
  await new Promise(r => setTimeout(r, 600))

  const ok = login(passcode.value)

  if (ok) {
    success.value = true
    loading.value = false
    await new Promise(r => setTimeout(r, 700))
    router.push('/dashboard')
  } else {
    loading.value = false
    error.value   = 'Incorrect passcode. Please try again.'
    shaking.value = true
    passcode.value = ''
    setTimeout(() => { shaking.value = false }, 600)
    inputRef.value?.focus()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Page layout ── */
.login-page {
  width: 100vw; height: 100vh;
  display: flex; align-items: stretch;
  position: relative; overflow: hidden;
  background: #faf8f5;
  font-family: 'DM Sans', sans-serif;
}

/* ── Animated background ── */
.bg-layer {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
}
.bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.35;
  animation: drift 12s ease-in-out infinite alternate;
}
.bg-orb--1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #d4a96a 0%, transparent 70%);
  top: -150px; left: -100px;
  animation-delay: 0s;
}
.bg-orb--2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #c9956e 0%, transparent 70%);
  bottom: -100px; right: 30%;
  animation-delay: -4s;
}
.bg-orb--3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #e8c9a0 0%, transparent 70%);
  top: 40%; left: 40%;
  animation-delay: -8s;
}
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(30px, 20px) scale(1.08); }
}
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(139,111,71,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,111,71,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── Login card (left side) ── */
.login-card {
  position: relative; z-index: 10;
  width: 100%; max-width: 480px;
  display: flex; flex-direction: column; justify-content: center;
  padding: 60px 64px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  border-right: 1px solid rgba(139,111,71,0.12);
  transition: transform 0.1s;
}
@media (max-width: 768px) {
  .login-card { max-width: 100%; border-right: none; padding: 40px 32px; }
  .side-panel { display: none; }
}

.login-card--shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-6px); }
  40%, 60% { transform: translateX(6px); }
}

/* ── Brand ── */
.brand {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 48px;
}
.brand__logo {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, #8B6F47, #c4956a);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(139,111,71,0.3);
}
.brand__name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; font-weight: 600;
  color: #1a1208; letter-spacing: 0.02em; line-height: 1.1;
}
.brand__sub {
  font-size: 11px; color: #a08060; margin-top: 2px;
  letter-spacing: 0.04em;
}

/* ── Heading ── */
.login-heading { margin-bottom: 36px; }
.login-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38px; font-weight: 500;
  color: #1a1208; line-height: 1.1;
  margin-bottom: 8px;
}
.login-desc { font-size: 14px; color: #8a7560; font-weight: 300; }

/* ── Input group ── */
.input-group { margin-bottom: 24px; }
.input-label {
  display: block; font-size: 12px; font-weight: 500;
  color: #6b5840; text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: 10px;
}
.input-wrap {
  position: relative; display: flex; align-items: center;
}
.input-icon {
  position: absolute; left: 16px;
  color: #b0926a; pointer-events: none;
}
.passcode-input {
  width: 100%; padding: 15px 48px 15px 46px;
  border: 1.5px solid #e8ddd0;
  border-radius: 14px;
  font-size: 16px; font-family: 'DM Sans', sans-serif;
  background: rgba(255,255,255,0.9);
  color: #1a1208; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  letter-spacing: 0.1em;
}
.passcode-input::placeholder { color: #c4b49e; letter-spacing: 0; }
.passcode-input:focus {
  border-color: #8B6F47;
  box-shadow: 0 0 0 4px rgba(139,111,71,0.1);
}
.input-group--error .passcode-input { border-color: #e05252; box-shadow: 0 0 0 4px rgba(224,82,82,0.08); }
.input-group--success .passcode-input { border-color: #3d9e6e; box-shadow: 0 0 0 4px rgba(61,158,110,0.1); }

.toggle-btn {
  position: absolute; right: 14px;
  background: none; border: none; cursor: pointer;
  color: #b0926a; padding: 6px; border-radius: 8px;
  display: flex; align-items: center;
  transition: color 0.15s, background 0.15s;
}
.toggle-btn:hover { color: #8B6F47; background: rgba(139,111,71,0.08); }

/* ── Pin dots ── */
.pin-dots {
  display: flex; align-items: center; gap: 6px;
  margin-top: 10px; padding-left: 4px;
}
.pin-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #8B6F47;
  animation: popIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.pin-more { font-size: 11px; color: #8B6F47; font-weight: 500; }

/* ── Error ── */
.error-msg {
  display: flex; align-items: center; gap: 6px;
  margin-top: 10px; font-size: 13px; color: #c0392b;
}
.err-enter-active { transition: all 0.2s; }
.err-enter-from   { opacity: 0; transform: translateY(-4px); }

/* ── Login button ── */
.login-btn {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, #8B6F47, #c4956a);
  color: white; border: none; border-radius: 14px;
  font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  cursor: pointer; letter-spacing: 0.04em;
  box-shadow: 0 8px 24px rgba(139,111,71,0.35);
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
  margin-bottom: 20px;
  min-height: 54px;
  display: flex; align-items: center; justify-content: center;
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(139,111,71,0.45);
}
.login-btn:active:not(:disabled) { transform: translateY(0); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.login-btn--success { background: linear-gradient(135deg, #2e9e6e, #3dc48a); box-shadow: 0 8px 24px rgba(61,158,110,0.35); }

.login-btn__text {
  display: flex; align-items: center; gap: 8px;
}

/* Dot loader */
.login-btn__loader { display: flex; gap: 5px; align-items: center; }
.login-btn__loader span {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,0.85);
  animation: bounce 0.9s ease-in-out infinite;
}
.dot-2 { animation-delay: 0.15s !important; }
.dot-3 { animation-delay: 0.3s !important; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40%            { transform: scale(1);   opacity: 1; }
}

/* ── Footer ── */
.login-footer {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: #a08060; justify-content: center;
}
.login-footer__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #3d9e6e;
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Side panel (right) ── */
.side-panel {
  flex: 1;
  position: relative; z-index: 5;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

/* Full-cover background image */
.side-panel::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url('/salon12.webp');
  background-size: cover;
  background-position: center;
  transform: scale(1.04);
  transition: transform 8s ease-in-out;
  animation: zoomBg 12s ease-in-out infinite alternate;
}
@keyframes zoomBg {
  from { transform: scale(1.04); }
  to   { transform: scale(1.12); }
}

/* Dark gradient overlay so text is readable */
.side-panel::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(10, 6, 2, 0.55) 0%,
    rgba(30, 18, 6, 0.45) 40%,
    rgba(60, 35, 10, 0.6) 100%
  );
}

.side-panel__inner {
  position: relative; z-index: 2;
  text-align: center; padding: 48px 40px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding-bottom: 64px;
}

/* Quote text — white on dark image */
.side-quote {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px; font-weight: 400; font-style: italic;
  color: rgba(255, 245, 230, 0.95); line-height: 1.55;
  max-width: 380px;
  margin: 0 auto 36px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
}

/* Divider line above stats */
.side-quote::after {
  content: '';
  display: block;
  width: 48px; height: 1px;
  background: rgba(212, 169, 106, 0.6);
  margin: 28px auto 0;
}

.side-stats {
  display: flex; gap: 40px; justify-content: center;
  margin-bottom: 0;
}
.stat__num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38px; font-weight: 600;
  color: #d4a96a;
  line-height: 1;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.stat__label {
  font-size: 10px; color: rgba(255,235,200,0.7);
  text-transform: uppercase;
  letter-spacing: 0.12em; margin-top: 5px;
}
.side-deco { display: none; }
</style>