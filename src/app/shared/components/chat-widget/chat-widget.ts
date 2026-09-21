import { Component, computed, signal } from '@angular/core';

interface ChatMessage {
  readonly id: number;
  readonly from: 'bot' | 'user';
  readonly text: string;
}

interface QuickReply {
  readonly label: string;
  readonly reply: string;
}

const RESPONSES: Record<string, string> = {
  digestive:
    'Digestive discomfort is often the clearest signal that something is off at the root. A consultation is where we map bloating, irregularity and discomfort back to a cause.',
  fatigue:
    'Fatigue that lingers is often connected to how your gut processes nutrients and regulates blood sugar — one of the most common threads we hear in a first consultation.',
  skin: 'Skin is one of the clearest windows into gut health. A consultation is where we map your specific pattern.',
  cycle:
    'Hormonal balance depends heavily on the gut. If your cycle feels irregular, it is worth exploring that connection with us.',
  brain:
    'Brain fog and mood can trace back to the gut-brain axis — a real, physical connection we look at in almost every consultation.',
  unsure:
    'That is exactly the right place to start. A first consultation is a 30-minute conversation where we find the common thread together.',
  default:
    'A 30-minute consultation is the best way to get a precise answer for your situation — every pattern is a little different.',
};

function keyFor(text: string): keyof typeof RESPONSES {
  const t = text.toLowerCase();
  if (/digest|bloat|bowel|stomach|gut/.test(t)) return 'digestive';
  if (/fatigue|tired|energy|exhaust/.test(t)) return 'fatigue';
  if (/skin|acne|eczema|rash/.test(t)) return 'skin';
  if (/cycle|hormone|period|pcos/.test(t)) return 'cycle';
  if (/fog|mood|brain|anxiety/.test(t)) return 'brain';
  if (/unsure|not sure|don't know|start/.test(t)) return 'unsure';
  return 'default';
}

@Component({
  selector: 'app-chat-widget',
  template: `
    <button
      type="button"
      class="launcher"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      aria-controls="easeChatPanel"
      aria-label="Ask the Ease guide"
      (click)="open.set(true)"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      </svg>
    </button>

    <div class="panel" id="easeChatPanel" role="dialog" aria-modal="true" aria-label="Ease guide chat" [class.open]="open()">
      <header>
        <div class="avatar" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#fff6ef" stroke-width="1.6" stroke-linecap="round">
            <path d="M9 3C5 3 3 6 3 9s2 6 6 6 6-2.7 6-6-2-6-6-6Z" opacity="0.6" />
            <path d="M9 6c-2 0-3 2-3 3s1 4 3 4" />
          </svg>
        </div>
        <div class="heading">
          <h3>Ease guide</h3>
          <p>Software, not a doctor — here to point you in a direction</p>
        </div>
        <button type="button" class="close" aria-label="Close chat" (click)="open.set(false)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </header>

      <div class="messages" aria-live="polite">
        @for (message of messages(); track message.id) {
          <div class="msg" [class.user]="message.from === 'user'">
            <div class="bubble">{{ message.text }}</div>
          </div>
        }
        @if (typing()) {
          <div class="msg">
            <div class="bubble typing"><span></span><span></span><span></span></div>
          </div>
        }
      </div>

      @if (showQuickReplies()) {
        <div class="chips">
          @for (chip of quickReplies; track chip.label) {
            <button type="button" class="chip" (click)="send(chip.reply)">{{ chip.label }}</button>
          }
        </div>
      }

      <form class="input-row" (submit)="submit($event)">
        <label class="sr-only" for="easeChatInput">Type your message</label>
        <input id="easeChatInput" type="text" placeholder="Or type your question…" [value]="draft()" (input)="draft.set($any($event.target).value)" />
        <button type="submit" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3L3 9l5 2M15 3L9 15l-1-6" />
          </svg>
        </button>
      </form>
    </div>
  `,
  styles: `
    .launcher {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--surface-deep);
      color: var(--ivory);
      box-shadow: var(--shadow-lift);
      cursor: pointer;
    }
    .panel {
      position: fixed;
      inset: auto var(--sp-5) calc(var(--sp-16) + 8px) var(--sp-5);
      max-width: 380px;
      margin-inline: auto;
      max-height: min(560px, 74vh);
      border-radius: var(--r-lg);
      background: var(--surface-deep);
      color: var(--ivory);
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lift);
      transform: translateY(16px) scale(0.98);
      opacity: 0;
      pointer-events: none;
      transition:
        transform var(--dur-base) var(--ease),
        opacity var(--dur-base) var(--ease);
      z-index: 110;
    }
    .panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }
    header {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4) var(--sp-5);
      border-bottom: 1px solid var(--rule-on-dark);
      flex: none;
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--gradient-ember);
      flex: none;
    }
    .heading h3 {
      font-family: var(--font-display);
      font-size: 0.98rem;
      margin: 0;
      color: var(--ivory);
    }
    .heading p {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-quiet-dark);
      margin: 2px 0 0;
    }
    .close {
      margin-left: auto;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--surface-glass-dark);
      color: var(--ivory);
      display: grid;
      place-items: center;
      cursor: pointer;
      flex: none;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--sp-5);
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
    }
    .msg {
      display: flex;
      max-width: 84%;
    }
    .msg.user {
      align-self: flex-end;
    }
    .bubble {
      padding: 10px 14px;
      border-radius: var(--r-md);
      border-bottom-left-radius: 6px;
      font-size: 0.88rem;
      line-height: var(--lh-body);
      background: var(--surface-glass-dark);
    }
    .msg.user .bubble {
      background: var(--gradient-ember);
      color: #fff6ef;
      border-bottom-left-radius: var(--r-md);
      border-bottom-right-radius: 6px;
    }
    .typing {
      display: flex;
      gap: 4px;
      padding: 12px 14px;
    }
    .typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-quiet-dark);
      animation: blink 1.4s ease-in-out infinite;
    }
    .typing span:nth-child(2) {
      animation-delay: 0.2s;
    }
    .typing span:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes blink {
      0%,
      60%,
      100% {
        opacity: 0.3;
      }
      30% {
        opacity: 1;
      }
    }
    .chips {
      padding: 0 var(--sp-5) var(--sp-3);
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }
    .chip {
      min-height: 36px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-pill);
      border: 1px solid var(--rule-on-dark);
      background: var(--surface-glass-dark);
      color: var(--ivory);
      font-size: 0.8rem;
      cursor: pointer;
    }
    .input-row {
      display: flex;
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4);
      border-top: 1px solid var(--rule-on-dark);
      flex: none;
    }
    .input-row input {
      flex: 1;
      min-height: 40px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-pill);
      border: 1px solid var(--rule-on-dark);
      background: var(--surface-glass-dark);
      color: var(--ivory);
      font-size: 0.88rem;
    }
    .input-row input::placeholder {
      color: var(--text-quiet-dark);
    }
    .input-row button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--gradient-ember);
      color: #fff6ef;
      display: grid;
      place-items: center;
      flex: none;
      cursor: pointer;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
  `,
})
export class ChatWidget {
  readonly open = signal(false);
  readonly draft = signal('');
  readonly typing = signal(false);
  readonly messages = signal<ChatMessage[]>([
    {
      id: 0,
      from: 'bot',
      text: "Hi — I'm the Ease guide. Tell me what you're feeling and I'll help you see if it connects to your gut.",
    },
  ]);

  readonly showQuickReplies = computed(() => this.messages().length <= 1);

  readonly quickReplies: readonly QuickReply[] = [
    { label: 'Digestive issues', reply: "I'm dealing with digestive issues" },
    { label: 'Fatigue or low energy', reply: 'I have persistent fatigue or low energy' },
    { label: 'Skin flare-ups', reply: 'My skin keeps flaring up' },
    { label: 'Cycle / hormones', reply: 'My cycle or hormones feel off' },
    { label: 'Not sure where to start', reply: "I'm not sure what's wrong" },
  ];

  submit(event: SubmitEvent): void {
    event.preventDefault();
    const value = this.draft().trim();
    if (!value) {
      return;
    }
    this.draft.set('');
    this.send(value);
  }

  send(text: string): void {
    const id = this.messages().length;
    this.messages.update((list) => [...list, { id, from: 'user', text }]);
    this.typing.set(true);
    setTimeout(() => {
      this.typing.set(false);
      this.messages.update((list) => [
        ...list,
        { id: id + 1, from: 'bot', text: RESPONSES[keyFor(text)] },
      ]);
    }, 900);
  }
}
