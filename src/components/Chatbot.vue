<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

interface ChatOption {
    label: string
    next?: string
    link?: string
}

interface ChatNode {
    text: string
    options: ChatOption[]
}

interface ChatMessage {
    id: number
    text: string
    sender: 'user' | 'bot'
    options?: ChatOption[]
}

// Unapred definisano stablo dijaloga
const tree: Record<string, ChatNode> = {
    start: {
        text: 'Zdravo! Ja sam Cvetni pomoćnik. Šta vas zanima?',
        options: [
            { label: 'Kako da rezervišem biljku?', next: 'how' },
            { label: 'Nega biljaka', next: 'care' },
            { label: 'Preporuči mi biljku', next: 'reco' },
            { label: 'Šta znače statusi?', next: 'status' }
        ]
    },
    how: {
        text: 'Otvorite biljku i kliknite „Rezerviši“. Ako niste prijavljeni, tražiće se prijava. Rezervacija se odmah pojavljuje u korpi rezervacija.',
        options: [{ label: 'Pregledaj biljke', link: '/' }, { label: 'Nazad', next: 'start' }]
    },
    care: {
        text: 'Za koju vrstu biljaka vam treba nega?',
        options: [{ label: 'Sobne', next: 'careIndoor' }, { label: 'Baštenske', next: 'careGarden' }, { label: 'Nazad', next: 'start' }]
    },
    careIndoor: {
        text: 'Sobne biljke vole jako svetlo bez direktnog sunca. Zalivajte tek kada se gornji sloj zemlje osuši.',
        options: [{ label: 'Prikaži sobne biljke', link: '/?type=sobna' }, { label: 'Nazad', next: 'care' }]
    },
    careGarden: {
        text: 'Baštenske biljke sadite u pravo godišnje doba. Tačno vreme sadnje piše u opisu svake biljke.',
        options: [{ label: 'Prikaži baštenske biljke', link: '/?type=baštenska' }, { label: 'Nazad', next: 'care' }]
    },
    reco: {
        text: 'Gde će biljka stajati?',
        options: [{ label: 'Sunčan balkon', next: 'recoSun' }, { label: 'Senovita soba', next: 'recoShade' }, { label: 'Nazad', next: 'start' }]
    },
    recoSun: {
        text: 'Za sunce preporučujem lavandu ili ehevariju.',
        options: [{ label: 'Lavanda', link: '/details/2' }, { label: 'Ehevarija', link: '/details/4' }, { label: 'Nazad', next: 'reco' }]
    },
    recoShade: {
        text: 'Za slabije svetlo odgovaraju monstera ili fikus.',
        options: [{ label: 'Monstera', link: '/details/1' }, { label: 'Fikus', link: '/details/10' }, { label: 'Nazad', next: 'reco' }]
    },
    unknown: {
        text: 'Nisam razumeo pitanje. Izaberite jednu od ponuđenih opcija.',
        options: [
            { label: 'Kako da rezervišem biljku?', next: 'how' },
            { label: 'Nega biljaka', next: 'care' },
            { label: 'Preporuči mi biljku', next: 'reco' },
            { label: 'Šta znače statusi?', next: 'status' }
        ]
    },
    status: {
        text: 'Rezervisano: čeka isporuku, možete je izmeniti ili otkazati. Pristiglo: stigla je, možete je oceniti ili obrisati. Otkazano: rezervacija je poništena.',
        options: [{ label: 'Otvori korpu', link: '/cart' }, { label: 'Nazad', next: 'start' }]
    }
}

// Ključne reči koje vode u odgovarajući čvor stabla
const keywords: Record<string, string[]> = {
    start: ['zdravo', 'ćao', 'cao', 'hej', 'pomoć', 'pomoc'],
    how: ['rezerv'],
    care: ['nega', 'zaliv', 'sadnj'],
    reco: ['preporuk', 'savet'],
    status: ['status', 'pristigl', 'otkaz']
}

const router = useRouter()
const inputMessage = ref('')
const isOpen = ref(false)
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
let nextMessageId = 1

const messages = ref<ChatMessage[]>([
    { id: nextMessageId++, text: tree.start!.text, sender: 'bot', options: tree.start!.options }
])

async function scrollToBottom() {
    await nextTick()
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

function choose(option: ChatOption) {
    if (isTyping.value) return

    if (option.link) {
        isOpen.value = false
        router.push(option.link)
        return
    }

    // Opcije prethodnih poruka se uklanjaju, aktivne su samo poslednje
    messages.value.forEach(m => m.options = undefined)
    messages.value.push({ id: nextMessageId++, text: option.label, sender: 'user' })
    isTyping.value = true
    scrollToBottom()

    window.setTimeout(() => {
        const node = tree[option.next ?? 'start']!
        messages.value.push({ id: nextMessageId++, text: node.text, sender: 'bot', options: node.options })
        isTyping.value = false
        scrollToBottom()
    }, 500)
}

function sendMessage() {
    const text = inputMessage.value.trim()
    if (!text || isTyping.value) return

    inputMessage.value = ''
    const lower = text.toLowerCase()
    const key = Object.keys(keywords).find(k => keywords[k]!.some(w => lower.includes(w)))
    choose({ label: text, next: key ?? 'unknown' })
}

function toggleChat() {
    isOpen.value = !isOpen.value
    if (isOpen.value) scrollToBottom()
}
</script>

<template>
    <div class="chatbot-widget">
        <button v-if="!isOpen" type="button" class="btn btn-primary chatbot-toggle rounded-circle shadow-lg"
            aria-label="Otvori pomoćnika" aria-haspopup="dialog" @click="toggleChat">
            <i class="fa-solid fa-spa fa-lg"></i>
            <span class="chatbot-notification"></span>
        </button>

        <section v-if="isOpen" class="card chatbot-window shadow-lg" role="dialog" aria-label="Cvetni pomoćnik"
            aria-modal="false">
            <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between py-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="chatbot-avatar"><i class="fa-solid fa-spa"></i></div>
                    <div>
                        <div class="fw-bold">Cvetni pomoćnik</div>
                        <small class="chatbot-status"><span class="status-dot"></span> Tu sam da pomognem</small>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-primary border-0" aria-label="Zatvori" @click="toggleChat">
                    <i class="fa-solid fa-xmark fa-lg"></i>
                </button>
            </div>

            <div ref="messagesContainer" class="card-body chatbot-messages" aria-live="polite" aria-relevant="additions">
                <div v-for="message in messages" :key="message.id" class="mb-3">
                    <div class="d-flex" :class="message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'">
                        <div class="chatbot-bubble"
                            :class="message.sender === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-bot'">
                            <div class="chatbot-message-text">{{ message.text }}</div>
                        </div>
                    </div>
                    <div v-if="message.options" class="chatbot-suggestions">
                        <button v-for="o in message.options" :key="o.label" type="button"
                            class="btn btn-sm btn-outline-primary rounded-pill mb-2" @click="choose(o)">
                            <i v-if="o.link" class="fa-solid fa-arrow-up-right-from-square"></i> {{ o.label }}
                        </button>
                    </div>
                </div>

                <div v-if="isTyping" class="d-flex justify-content-start mb-3">
                    <div class="chatbot-bubble chatbot-bubble-bot">
                        <span class="typing-indicator" aria-label="Pomoćnik kuca"><span></span><span></span><span></span></span>
                    </div>
                </div>
            </div>

            <div class="card-footer bg-body">
                <form class="input-group" @submit.prevent="sendMessage">
                    <input type="text" class="form-control" v-model="inputMessage" placeholder="Postavite pitanje..."
                        aria-label="Poruka pomoćniku">
                    <button class="btn btn-primary" type="submit" aria-label="Pošalji"><i
                            class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>
        </section>
    </div>
</template>

<style scoped>
.chatbot-widget {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1055;
    font-family: inherit;
}

.chatbot-toggle {
    position: relative;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

.chatbot-toggle:hover {
    transform: scale(1.06);
}

.chatbot-notification {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 12px;
    height: 12px;
    background-color: #20c997;
    border: 2px solid var(--bs-body-bg);
    border-radius: 50%;
}

.chatbot-window {
    width: 370px;
    height: min(540px, calc(100dvh - 100px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 16px;
    border-color: var(--bs-border-color);
    background-color: var(--bs-body-bg);
    animation: chatbot-appear 0.2s ease-out;
}

.chatbot-window>.card-header {
    flex-shrink: 0;
}

.chatbot-avatar {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    font-size: 18px;
}

.chatbot-status {
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.9;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #20c997;
}

.chatbot-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 20px 14px;
    scroll-behavior: smooth;
}

.chatbot-bubble {
    max-width: 85%;
    padding: 11px 14px;
    border-radius: 16px;
    overflow-wrap: anywhere;
    font-size: 0.925rem;
    line-height: 1.5;
}

.chatbot-bubble-user {
    color: #fff;
    background-color: var(--bs-primary);
    border-bottom-right-radius: 4px;
}

.chatbot-bubble-bot {
    color: var(--bs-body-color);
    background-color: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    border-bottom-left-radius: 4px;
}

.chatbot-message-text {
    white-space: pre-wrap;
}

.chatbot-suggestions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 20px;
}

.chatbot-suggestions .btn {
    white-space: normal;
    text-align: left;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 4px 2px;
}

.typing-indicator span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--bs-secondary-color);
    animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.3s;
}

.chatbot-window .card-footer {
    flex-shrink: 0;
    border-top: 1px solid var(--bs-border-color);
}

@keyframes typing {

    0%,
    60%,
    100% {
        opacity: 0.4;
        transform: translateY(0);
    }

    30% {
        opacity: 1;
        transform: translateY(-4px);
    }
}

@keyframes chatbot-appear {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (max-width: 576px) {
    .chatbot-widget {
        right: 12px;
        bottom: 12px;
    }

    .chatbot-window {
        position: fixed;
        right: 12px;
        bottom: 12px;
        width: calc(100vw - 24px);
        height: min(600px, calc(100dvh - 24px));
        max-width: 400px;
    }

    .chatbot-toggle {
        width: 56px;
        height: 56px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .chatbot-window,
    .chatbot-toggle,
    .typing-indicator span {
        animation: none;
        transition: none;
    }
}
</style>
