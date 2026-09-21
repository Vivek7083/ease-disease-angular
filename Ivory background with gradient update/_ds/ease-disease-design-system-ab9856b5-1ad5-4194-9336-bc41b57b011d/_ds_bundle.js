/* @ds-bundle: {"format":4,"namespace":"EaseDiseaseDesignSystem_ab9856","components":[{"name":"CtaPill","sourcePath":"components/actions/CtaPill.jsx"},{"name":"Wordmark","sourcePath":"components/brand/Wordmark.jsx"},{"name":"ChatBubble","sourcePath":"components/chat/ChatBubble.jsx"},{"name":"ChatPanel","sourcePath":"components/chat/ChatPanel.jsx"},{"name":"DisplayBlock","sourcePath":"components/content/DisplayBlock.jsx"},{"name":"EvidenceTick","sourcePath":"components/content/EvidenceTick.jsx"},{"name":"EyebrowLabel","sourcePath":"components/content/EyebrowLabel.jsx"},{"name":"MenuDot","sourcePath":"components/navigation/MenuDot.jsx"},{"name":"MenuOverlay","sourcePath":"components/navigation/MenuOverlay.jsx"},{"name":"SymptomNode","sourcePath":"components/story/SymptomNode.jsx"},{"name":"Thread","sourcePath":"components/story/Thread.jsx"},{"name":"FooterClose","sourcePath":"components/surfaces/FooterClose.jsx"},{"name":"LevelCard","sourcePath":"components/surfaces/LevelCard.jsx"},{"name":"TeamCard","sourcePath":"components/surfaces/TeamCard.jsx"}],"sourceHashes":{"components/actions/CtaPill.jsx":"0fc050cfa38e","components/brand/Wordmark.jsx":"b58ea44e57c7","components/chat/ChatBubble.jsx":"469d7a19b5a6","components/chat/ChatPanel.jsx":"3595537927f6","components/content/DisplayBlock.jsx":"5f3d09973443","components/content/EvidenceTick.jsx":"3518e8214bd1","components/content/EyebrowLabel.jsx":"0448af4b1edb","components/navigation/MenuDot.jsx":"bfb1f6c07912","components/navigation/MenuOverlay.jsx":"a187f5827a63","components/story/SymptomNode.jsx":"05156fe6c071","components/story/Thread.jsx":"04b916fcda72","components/surfaces/FooterClose.jsx":"c0d17d36636b","components/surfaces/LevelCard.jsx":"2b6ef7f16d0b","components/surfaces/TeamCard.jsx":"5cbcdab8bc77","ui_kits/root-map/App.jsx":"c5b94ee97aa9","ui_kits/scrollytelling/scrollytelling.app.jsx":"cd0856483351"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EaseDiseaseDesignSystem_ab9856 = window.EaseDiseaseDesignSystem_ab9856 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/CtaPill.jsx
try { (() => {
function CtaPill({
  label = 'Book a consultation',
  variant = 'primary',
  compact = false,
  meta,
  disabled = false,
  floating = false,
  href = '#book',
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const primary = variant === 'primary';
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--sp-3)',
    minHeight: 'var(--tap-min)',
    padding: compact ? '0 var(--sp-5)' : '0 var(--sp-6)',
    borderRadius: 'var(--r-pill)',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: compact ? 15 : 16,
    letterSpacing: '0.005em',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    border: 'none',
    opacity: disabled ? 0.45 : 1,
    transition: 'transform var(--dur-micro) var(--ease), box-shadow var(--dur-base) var(--ease)',
    transform: hover && !disabled ? 'translateY(-1px)' : 'none'
  };
  const skins = {
    primary: {
      color: 'var(--ivory)',
      backgroundImage: 'var(--gradient-ember)',
      backgroundSize: '220% 100%',
      animation: 'ember-drift var(--drift-ember) var(--drift-ease) infinite',
      boxShadow: hover && !disabled ? '0 16px 40px rgba(179,58,30,.42)' : 'var(--shadow-ember)'
    },
    // ghostLight = ivory ink, for --surface-deep panels and the menu overlay
    ghostLight: {
      color: 'var(--ivory)',
      background: 'var(--surface-glass-dark)',
      boxShadow: 'inset 0 0 0 1px rgba(251,247,240,.38)'
    },
    // ghostDark = ink, for the ivory-first canvas
    ghostDark: {
      color: 'var(--ink)',
      background: 'var(--surface-glass-light)',
      boxShadow: 'inset 0 0 0 1px rgba(30,23,20,.32)'
    }
  };
  const skin = skins[variant] || skins.primary;
  return /*#__PURE__*/React.createElement("a", {
    href: disabled ? undefined : href,
    onClick: disabled ? undefined : onClick,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : 0,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...skin,
      position: floating ? 'fixed' : 'relative',
      right: floating ? 'var(--sp-6)' : undefined,
      bottom: floating ? 'var(--sp-6)' : undefined,
      zIndex: floating ? 40 : undefined,
      outlineOffset: 3
    },
    onFocus: e => e.currentTarget.style.outline = '2px solid var(--honey)',
    onBlur: e => e.currentTarget.style.outline = 'none'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, label), meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      flex: '0 0 auto',
      paddingLeft: 'var(--sp-3)',
      borderLeft: '1px solid ' + (primary ? 'rgba(251,247,240,.42)' : 'currentColor')
    }
  }, meta) : null);
}
Object.assign(__ds_scope, { CtaPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/CtaPill.jsx", error: String((e && e.message) || e) }); }

// components/brand/Wordmark.jsx
try { (() => {
/** Placeholder wordmark. No real logo was supplied with the brief — this renders the
 *  brand name in type. `tone` names the GROUND it sits on. */
const TONE = {
  light: {
    ink: 'var(--ink)',
    quiet: 'var(--text-quiet-light)'
  },
  dark: {
    ink: 'var(--ivory)',
    quiet: 'var(--text-quiet-dark)'
  }
};
function Wordmark({
  tone = 'light',
  size = 'md',
  name,
  text,
  tagline,
  href = '#top',
  onClick
}) {
  const t = TONE[tone] || TONE.light;
  const label = name || text || '[BRAND NAME]';
  const fs = size === 'sm' ? 16 : size === 'lg' ? 28 : 20;
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: onClick,
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 'var(--sp-1)',
      textDecoration: 'none',
      color: t.ink,
      minHeight: 'var(--tap-min)',
      justifyContent: 'center',
      transition: 'opacity var(--dur-micro) var(--ease)'
    },
    onMouseEnter: e => e.currentTarget.style.opacity = '.78',
    onMouseLeave: e => e.currentTarget.style.opacity = '1'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: fs,
      letterSpacing: '-0.015em',
      lineHeight: 1,
      // Contrast comes from the ink, never from a glow. The shadow only softens the
      // mark against a photograph or a --surface-deep panel edge.
      textShadow: tone === 'dark' ? '0 1px 12px rgba(43,10,15,.45)' : 'none'
    }
  }, label), tagline ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: t.quiet
    }
  }, tagline) : null);
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/chat/ChatBubble.jsx
try { (() => {
function ChatBubble({
  unread = false,
  open = false,
  onClick,
  label = 'Ease guide',
  floating = false,
  offsetRight = 'calc(var(--sp-6) + 220px)'
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": open ? 'Close ' + label : 'Open ' + label,
    "aria-expanded": open,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: floating ? 'fixed' : 'relative',
      right: floating ? offsetRight : undefined,
      bottom: floating ? 'var(--sp-6)' : undefined,
      zIndex: floating ? 41 : undefined,
      flex: '0 0 auto',
      width: 'var(--tap-min)',
      height: 'var(--tap-min)',
      borderRadius: 'var(--r-pill)',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      background: open ? 'var(--ivory)' : 'var(--surface-card-dark)',
      border: '1px solid ' + (open ? 'transparent' : 'rgba(251,247,240,.28)'),
      boxShadow: hover ? 'var(--shadow-lift)' : 'var(--shadow-soft)',
      transform: hover ? 'translateY(-1px)' : 'none',
      transition: 'transform var(--dur-micro) var(--ease), box-shadow var(--dur-base) var(--ease), background var(--dur-base) var(--ease)'
    }
  }, open ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l10 10M14 4L4 14",
    stroke: "var(--ink)",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.4c0-2.4 2.3-4.4 5.1-4.4h2.8c2.8 0 5.1 2 5.1 4.4s-2.3 4.4-5.1 4.4H8.2L4.6 15.6l.6-2.9C4.2 11.9 3.5 10.2 3.5 8.4Z",
    stroke: "var(--ivory)",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  })), unread && !open ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 9,
      height: 9,
      borderRadius: 'var(--r-pill)',
      background: 'var(--honey)',
      boxShadow: '0 0 0 2px var(--surface-card-dark)'
    }
  }) : null);
}
Object.assign(__ds_scope, { ChatBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/ChatBubble.jsx", error: String((e && e.message) || e) }); }

// components/chat/ChatPanel.jsx
try { (() => {
function Bubble({
  from,
  children
}) {
  const guide = from === 'guide';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: guide ? 'flex-start' : 'flex-end',
      maxWidth: '84%',
      background: guide ? 'var(--parchment)' : 'var(--oxblood)',
      color: guide ? 'var(--ink)' : 'var(--ivory)',
      padding: 'var(--sp-3) var(--sp-4)',
      borderRadius: guide ? 'var(--r-md) var(--r-md) var(--r-md) var(--r-xs)' : 'var(--r-md) var(--r-md) var(--r-xs) var(--r-md)',
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.5
    }
  }, children);
}
function Typing() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: 'flex-start',
      display: 'flex',
      gap: 5,
      padding: 'var(--sp-3) var(--sp-4)',
      background: 'var(--parchment)',
      borderRadius: 'var(--r-md) var(--r-md) var(--r-md) var(--r-xs)'
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: 'var(--r-pill)',
      background: 'var(--text-quiet-light)',
      animation: 'ease-typing 1.1s var(--ease) ' + i * 0.16 + 's infinite'
    }
  })), /*#__PURE__*/React.createElement("style", null, '@keyframes ease-typing{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}'));
}
function ChatPanel({
  open = true,
  title = 'Ease guide',
  subtitle = 'Answers about digestion, bookings and levels',
  messages = [],
  quickReplies = [],
  typing = false,
  onClose,
  onQuickReply,
  onSend,
  mobile = false
}) {
  const [draft, setDraft] = React.useState('');
  if (!open) return null;
  return /*#__PURE__*/React.createElement("section", {
    role: "dialog",
    "aria-label": title,
    style: {
      position: mobile ? 'fixed' : 'relative',
      inset: mobile ? 0 : undefined,
      width: mobile ? 'auto' : 360,
      height: mobile ? 'auto' : 520,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--ivory)',
      color: 'var(--ink)',
      borderRadius: mobile ? 0 : 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lift)',
      zIndex: 42
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      padding: 'var(--sp-4) var(--sp-5)',
      background: 'var(--oxblood-deep)',
      color: 'var(--ivory)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 'var(--r-pill)',
      background: 'var(--honey)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 17,
      fontWeight: 600
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.06em',
      color: 'var(--text-quiet-dark)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close chat",
    style: {
      width: 'var(--tap-min)',
      height: 'var(--tap-min)',
      display: 'grid',
      placeItems: 'center',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 3.5l9 9M12.5 3.5l-9 9",
    stroke: "var(--ivory)",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)',
      padding: 'var(--sp-5)',
      background: 'var(--ivory)'
    }
  }, messages.map((m, i) => /*#__PURE__*/React.createElement(Bubble, {
    key: i,
    from: m.from
  }, m.text)), typing ? /*#__PURE__*/React.createElement(Typing, null) : null), quickReplies.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--sp-2)',
      padding: '0 var(--sp-5) var(--sp-4)'
    }
  }, quickReplies.map(q => /*#__PURE__*/React.createElement("button", {
    key: q,
    type: "button",
    onClick: () => onQuickReply && onQuickReply(q),
    style: {
      minHeight: 36,
      padding: '0 var(--sp-4)',
      borderRadius: 'var(--r-pill)',
      cursor: 'pointer',
      background: 'transparent',
      border: '1px solid var(--rule-on-light)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      transition: 'background var(--dur-micro) var(--ease)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-glass-light)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, q))) : null, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      if (draft.trim() && onSend) onSend(draft.trim());
      setDraft('');
    },
    style: {
      display: 'flex',
      gap: 'var(--sp-2)',
      padding: 'var(--sp-4) var(--sp-5)',
      borderTop: '1px solid var(--rule-on-light)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: "Ask about your symptoms",
    style: {
      flex: 1,
      minWidth: 0,
      minHeight: 'var(--tap-min)',
      padding: '0 var(--sp-4)',
      borderRadius: 'var(--r-pill)',
      border: '1px solid var(--rule-on-light)',
      background: 'var(--surface-glass-light)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      outlineOffset: 2
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    "aria-label": "Send",
    style: {
      width: 'var(--tap-min)',
      height: 'var(--tap-min)',
      borderRadius: 'var(--r-pill)',
      border: 'none',
      backgroundImage: 'var(--gradient-ember)',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 15 15 9 3 3l2.2 6L3 15Z",
    stroke: "var(--ivory)",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  })))));
}
Object.assign(__ds_scope, { ChatPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/ChatPanel.jsx", error: String((e && e.message) || e) }); }

// components/content/DisplayBlock.jsx
try { (() => {
function DisplayBlock({
  eyebrow,
  count,
  headline,
  body,
  highlight,
  tone = 'dark',
  size = 'l',
  align = 'left',
  children
}) {
  const ink = tone === 'dark' ? 'var(--ivory)' : 'var(--ink)';
  const quiet = tone === 'dark' ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)';
  const fs = {
    xl: 'var(--fs-display-xl)',
    l: 'var(--fs-display-l)',
    m: 'var(--fs-display-m)',
    s: 'var(--fs-display-s)'
  }[size];
  const parts = highlight && typeof headline === 'string' ? headline.split(highlight) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-5)',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align
    }
  }, eyebrow ? /*#__PURE__*/React.createElement(EyebrowSlot, {
    eyebrow: eyebrow,
    count: count,
    tone: tone
  }) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      color: ink,
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: fs,
      lineHeight: 'var(--lh-display)',
      letterSpacing: 'var(--ls-display)',
      maxWidth: 'var(--measure-display)',
      textWrap: 'balance'
    }
  }, parts ? /*#__PURE__*/React.createElement(React.Fragment, null, parts[0], /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '0 .06em',
      // Honey may sit BEHIND ink only (10.5:1). On dark stops the ivory headline
      // would read at ~1.6:1 over honey, so the wash drops below the baseline
      // and becomes an underline-weight mark that never crosses a glyph.
      background: tone === 'dark' ? 'linear-gradient(to top, var(--honey) 0 0.1em, transparent 0.1em)' : 'linear-gradient(to top, var(--honey) 0 26%, transparent 26%)'
    }
  }, highlight), parts.slice(1).join(highlight)) : headline), body ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: quiet,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body-m)',
      lineHeight: 'var(--lh-body)',
      maxWidth: 'var(--measure-body)',
      textWrap: 'pretty'
    }
  }, body) : null, children);
}
function EyebrowSlot({
  eyebrow,
  count,
  tone
}) {
  const color = tone === 'dark' ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      color
    }
  }, count ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)'
    }
  }, count) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 1,
      background: tone === 'dark' ? 'var(--rule-on-dark)' : 'var(--rule-on-light)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase'
    }
  }, eyebrow));
}
Object.assign(__ds_scope, { DisplayBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/DisplayBlock.jsx", error: String((e && e.message) || e) }); }

// components/content/EvidenceTick.jsx
try { (() => {
function EvidenceTick({
  children,
  tone = 'dark',
  source
}) {
  const ink = tone === 'dark' ? 'var(--ivory)' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("li", {
    style: {
      display: 'flex',
      gap: 'var(--sp-3)',
      alignItems: 'flex-start',
      listStyle: 'none',
      color: ink
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none",
    "aria-hidden": "true",
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "9",
    stroke: "var(--evidence-blue)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 10.4 8.8 13.2 14 7.6",
    stroke: "var(--evidence-blue)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body-m)',
      lineHeight: 'var(--lh-body)'
    }
  }, children, source ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.04em',
      color: tone === 'dark' ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)',
      marginTop: 'var(--sp-1)'
    }
  }, source) : null));
}
Object.assign(__ds_scope, { EvidenceTick });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/EvidenceTick.jsx", error: String((e && e.message) || e) }); }

// components/content/EyebrowLabel.jsx
try { (() => {
function EyebrowLabel({
  children,
  tone = 'dark',
  rule = true,
  count
}) {
  const color = tone === 'dark' ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      color
    }
  }, count ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)'
    }
  }, count) : null, rule ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 1,
      background: tone === 'dark' ? 'var(--rule-on-dark)' : 'var(--rule-on-light)'
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      lineHeight: 'var(--lh-eyebrow)'
    }
  }, children));
}
Object.assign(__ds_scope, { EyebrowLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/EyebrowLabel.jsx", error: String((e && e.message) || e) }); }

// components/navigation/MenuDot.jsx
try { (() => {
function MenuDot({
  open = false,
  tone = 'dark',
  onClick,
  label = 'Menu'
}) {
  const [hover, setHover] = React.useState(false);
  const ink = tone === 'dark' ? 'var(--ivory)' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": open ? 'Close menu' : label,
    "aria-expanded": open,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'fixed',
      top: 'var(--sp-5)',
      right: 'var(--sp-5)',
      zIndex: 60,
      width: 'var(--tap-min)',
      height: 'var(--tap-min)',
      borderRadius: 'var(--r-pill)',
      display: 'grid',
      placeItems: 'center',
      border: 'none',
      cursor: 'pointer',
      background: hover ? tone === 'dark' ? 'var(--surface-glass-dark)' : 'var(--surface-glass-light)' : 'transparent',
      transition: 'background var(--dur-micro) var(--ease)'
    }
  }, open ? /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l10 10M14 4L4 14",
    stroke: ink,
    strokeWidth: "1.6",
    strokeLinecap: "round"
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 'var(--r-pill)',
      background: ink,
      boxShadow: hover ? '0 0 0 5px ' + (tone === 'dark' ? 'rgba(251,247,240,.14)' : 'rgba(30,23,20,.10)') : 'none',
      transition: 'box-shadow var(--dur-micro) var(--ease)'
    }
  }));
}
Object.assign(__ds_scope, { MenuDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/MenuDot.jsx", error: String((e && e.message) || e) }); }

// components/navigation/MenuOverlay.jsx
try { (() => {
const DEFAULT_ITEMS = [{
  label: 'Events',
  href: '#events',
  note: 'Online and offline'
}, {
  label: 'Login',
  href: '#login',
  note: 'Bookings and meet links'
}, {
  label: 'Community',
  href: '#community',
  note: 'Join the group'
}];
function MenuOverlay({
  open = false,
  items = DEFAULT_ITEMS,
  onClose,
  footNote = '[SUPPORT EMAIL]'
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Menu",
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 55,
      background: 'var(--oxblood-deep)',
      color: 'var(--ivory)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 'var(--sp-16) var(--gutter-mobile)',
      animation: 'ease-overlay-in var(--dur-base) var(--ease) both'
    }
  }, /*#__PURE__*/React.createElement("style", null, '@keyframes ease-overlay-in{from{opacity:0}to{opacity:1}}'), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-6)',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      width: '100%'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("a", {
    key: it.label,
    href: it.href,
    onClick: onClose,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--sp-5)',
      textDecoration: 'none',
      color: 'var(--ivory)',
      minHeight: 'var(--tap-min)',
      transition: 'color var(--dur-micro) var(--ease)'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--honey)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--ivory)'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      color: 'var(--text-quiet-dark)'
    }
  }, '0' + (i + 1)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--fs-display-m)',
      lineHeight: 1.05
    }
  }, it.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--text-quiet-dark)'
    }
  }, it.note)))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-16) auto 0',
      maxWidth: 'var(--container-max)',
      width: '100%',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.06em',
      color: 'var(--text-quiet-dark)'
    }
  }, footNote));
}
Object.assign(__ds_scope, { MenuOverlay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/MenuOverlay.jsx", error: String((e && e.message) || e) }); }

// components/story/SymptomNode.jsx
try { (() => {
function SymptomNode({
  label = '[SYMPTOM]',
  note,
  tone = 'light',
  size = 'md',
  state = 'default',
  center = false,
  selected = false,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const dark = tone === 'dark';
  const active = state === 'active' || hover;
  const pad = {
    sm: 'var(--sp-2) var(--sp-4)',
    md: 'var(--sp-3) var(--sp-5)',
    lg: 'var(--sp-4) var(--sp-6)'
  }[size];
  const fs = {
    sm: 13,
    md: 15,
    lg: 17
  }[size];
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-pressed": onClick ? selected : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    disabled: !onClick && state === 'muted',
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'flex-start',
      alignSelf: 'center',
      flex: '0 0 auto',
      width: 'fit-content',
      maxWidth: '100%',
      minHeight: 'var(--tap-min)',
      padding: pad,
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: center ? 'var(--r-lg)' : 'var(--r-pill)',
      fontFamily: center ? 'var(--font-display)' : 'var(--font-body)',
      fontSize: center ? fs + 4 : fs,
      fontWeight: center ? 600 : 400,
      textAlign: 'left',
      color: selected ? 'var(--ivory)' : dark && !(state === 'active') ? 'var(--ivory)' : 'var(--ink)',
      background: selected ? 'var(--surface-deep)' : center ? dark ? 'var(--surface-deep-raised)' : 'var(--ivory)' : state === 'active' ? 'var(--ember-b)' : active ? dark ? 'rgba(251,247,240,.12)' : 'var(--ivory)' : 'transparent',
      border: '1px solid ' + (selected ? 'var(--surface-deep)' : center ? 'transparent' : state === 'active' ? 'var(--ember-b)' : dark ? 'rgba(251,247,240,.30)' : 'var(--rule-on-light)'),
      boxShadow: center ? 'var(--shadow-lift)' : active ? 'var(--shadow-soft)' : 'none',
      opacity: state === 'muted' ? 0.42 : 1,
      transform: active && !center ? 'translateY(-1px)' : 'none',
      transition: 'all var(--dur-micro) var(--ease)'
    }
  }, /*#__PURE__*/React.createElement("span", null, label), note ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: .62
    }
  }, note) : null);
}
Object.assign(__ds_scope, { SymptomNode });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/story/SymptomNode.jsx", error: String((e && e.message) || e) }); }

// components/story/Thread.jsx
try { (() => {
/** Connecting thread between symptom nodes. Draws as an SVG stroke, not a border. */
function Thread({
  orientation = 'vertical',
  length = 96,
  progress = 1,
  tone = 'light',
  curve = 0,
  label
}) {
  const dark = tone === 'dark';
  const stroke = dark ? 'rgba(251,247,240,.45)' : 'var(--rule-on-light)';
  const lit = dark ? 'var(--ember-b)' : 'var(--ember-a)';
  const vertical = orientation === 'vertical';
  const w = vertical ? Math.max(2, Math.abs(curve) * 2 + 2) : length;
  const h = vertical ? length : Math.max(2, Math.abs(curve) * 2 + 2);
  const d = vertical ? 'M' + w / 2 + ' 0 C' + (w / 2 + curve) + ' ' + h / 3 + ' ' + (w / 2 + curve) + ' ' + h * 2 / 3 + ' ' + w / 2 + ' ' + h : 'M0 ' + h / 2 + ' C' + w / 3 + ' ' + (h / 2 + curve) + ' ' + w * 2 / 3 + ' ' + (h / 2 + curve) + ' ' + w + ' ' + h / 2;
  const len = vertical ? h : w;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    viewBox: '0 0 ' + w + ' ' + h,
    fill: "none",
    "aria-hidden": "true",
    style: {
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: d,
    stroke: stroke,
    strokeWidth: "var(--bw-thread)",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: d,
    stroke: lit,
    strokeWidth: "var(--bw-thread)",
    strokeLinecap: "round",
    strokeDasharray: len,
    strokeDashoffset: len * (1 - Math.min(1, Math.max(0, progress))),
    style: {
      transition: 'stroke-dashoffset var(--dur-base) var(--ease)'
    }
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: dark ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Thread });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/story/Thread.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/FooterClose.jsx
try { (() => {
function FooterClose({
  eyebrow = 'Since you are here',
  headline = 'Start now',
  body = '[CLOSING LINE]',
  links = [{
    label: 'Events',
    href: '#events'
  }, {
    label: 'Login',
    href: '#login'
  }, {
    label: 'Community',
    href: '#community'
  }],
  supportEmail = '[SUPPORT EMAIL]',
  whatsapp = '[WHATSAPP]',
  brandName = '[BRAND NAME]',
  onBook
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-deep)',
      color: 'var(--ivory)',
      borderRadius: 'var(--r-xl)',
      padding: 'var(--sp-12) var(--sp-8)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)',
      boxShadow: 'var(--shadow-lift)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-quiet-dark)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--fs-display-l)',
      lineHeight: 1.02,
      letterSpacing: 'var(--ls-display)'
    }
  }, headline), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body-m)',
      lineHeight: 'var(--lh-body)',
      maxWidth: '48ch',
      color: 'var(--text-quiet-dark)'
    }
  }, body)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBook,
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      minHeight: 'var(--tap-min)',
      padding: '0 var(--sp-6)',
      borderRadius: 'var(--r-pill)',
      border: 'none',
      backgroundImage: 'var(--gradient-ember)',
      backgroundSize: '200% 100%',
      color: 'var(--ivory)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body-m)',
      fontWeight: 500,
      cursor: 'pointer',
      boxShadow: 'var(--shadow-ember)',
      animation: 'ember-drift var(--drift-ember) linear infinite'
    }
  }, "Book a consultation", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      padding: '2px var(--sp-2)',
      borderRadius: 'var(--r-pill)',
      background: 'rgba(43,10,15,.28)'
    }
  }, "30 min \xB7 \u20B9499")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--rule-on-dark)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--sp-8)',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--sp-6)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--ivory)',
      textDecoration: 'none',
      minHeight: 'var(--tap-min)',
      display: 'inline-flex',
      alignItems: 'center'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--honey)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--ivory)'
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-1)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.06em',
      color: 'var(--text-quiet-dark)'
    }
  }, /*#__PURE__*/React.createElement("span", null, supportEmail), /*#__PURE__*/React.createElement("span", null, whatsapp), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 15,
      letterSpacing: '-0.01em',
      color: 'var(--ivory)',
      marginTop: 'var(--sp-2)'
    }
  }, brandName))));
}
Object.assign(__ds_scope, { FooterClose });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/FooterClose.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/LevelCard.jsx
try { (() => {
function LevelCard({
  index = '01',
  name = '[LEVEL NAME]',
  description = '[LEVEL DESCRIPTION]',
  state = 'bookable',
  duration,
  price,
  note = 'Coming after your call',
  bullets = [],
  onBook,
  active = false
}) {
  const [hover, setHover] = React.useState(false);
  const bookable = state === 'bookable';
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-4)',
      padding: 'var(--sp-6)',
      borderRadius: 'var(--r-lg)',
      minWidth: 0,
      background: bookable ? 'var(--ivory)' : 'var(--surface-glass-light)',
      border: '1px solid ' + (bookable ? 'var(--rule-on-light)' : 'rgba(30,23,20,.14)'),
      color: 'var(--ink)',
      boxShadow: bookable && (hover || active) ? 'var(--shadow-lift)' : bookable ? 'var(--shadow-soft)' : 'none',
      transform: bookable && hover ? 'translateY(-2px)' : 'none',
      opacity: bookable ? 1 : .88,
      transition: 'transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)'
    }
  }, "LEVEL ", index), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--rule-on-light)'
    }
  }), bookable ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '3px var(--sp-3)',
      borderRadius: 'var(--r-pill)',
      background: 'var(--honey)',
      color: 'var(--ink)'
    }
  }, "Bookable") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.08em',
      color: 'var(--text-quiet-light)'
    }
  }, note)), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--fs-display-s)',
      lineHeight: 1.06,
      letterSpacing: '-0.015em'
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.55,
      color: 'var(--text-quiet-light)'
    }
  }, description), bullets.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)'
    }
  }, bullets.map(b => /*#__PURE__*/React.createElement("li", {
    key: b,
    style: {
      display: 'flex',
      gap: 'var(--sp-3)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    style: {
      flex: '0 0 auto',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    stroke: "var(--evidence-blue)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React.createElement("span", null, b)))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      flexWrap: 'wrap'
    }
  }, bookable ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14
    }
  }, duration, " \xB7 ", price), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBook,
    style: {
      minHeight: 'var(--tap-min)',
      padding: '0 var(--sp-5)',
      borderRadius: 'var(--r-pill)',
      border: 'none',
      backgroundImage: 'var(--gradient-ember)',
      backgroundSize: '200% 100%',
      color: 'var(--ivory)',
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      fontWeight: 500,
      cursor: 'pointer',
      boxShadow: hover ? 'var(--shadow-ember)' : 'none',
      transition: 'box-shadow var(--dur-base) var(--ease)'
    }
  }, "Book this level")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text-quiet-light)'
    }
  }, "[PRICING AFTER CONSULTATION]")));
}
Object.assign(__ds_scope, { LevelCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/LevelCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/TeamCard.jsx
try { (() => {
function TeamCard({
  name = '[NAME]',
  credential = '[CREDENTIAL]',
  role,
  tone = 'light',
  photoRatio = '3 / 4'
}) {
  const dark = tone === 'dark';
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-4)',
      padding: 'var(--sp-4)',
      borderRadius: 'var(--r-lg)',
      minWidth: 0,
      background: dark ? 'var(--surface-deep-raised)' : 'var(--ivory)',
      border: '1px solid ' + (dark ? 'rgba(251,247,240,.16)' : 'var(--rule-on-light)'),
      color: dark ? 'var(--ivory)' : 'var(--ink)',
      boxShadow: dark ? 'none' : 'var(--shadow-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: photoRatio,
      borderRadius: 'var(--r-md)',
      display: 'grid',
      placeItems: 'center',
      background: dark ? 'rgba(251,247,240,.07)' : 'var(--parchment)',
      color: dark ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase'
    }
  }, "[PHOTO]")), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 19,
      letterSpacing: '-0.01em'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-2)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: dark ? 'var(--text-quiet-dark)' : 'var(--text-quiet-light)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.5l3 3 6-7",
    stroke: "var(--evidence-blue)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), credential), role ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: .7
    }
  }, role) : null));
}
Object.assign(__ds_scope, { TeamCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/TeamCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/root-map/App.jsx
try { (() => {
const {
  Wordmark,
  CtaPill,
  ChatBubble,
  ChatPanel,
  EyebrowLabel,
  DisplayBlock,
  SymptomNode,
  FooterClose
} = window.EaseDiseaseDesignSystem_ab9856;

/* ---- DRAFT DATA: every link below is a placeholder for clinician review ---- */
const S = [['bloat', 'Bloating'], ['fatigue', 'Fatigue'], ['skin', 'Skin flare-ups'], ['fog', 'Brain fog'], ['sleep', 'Poor sleep'], ['cycle', 'Cycle changes'], ['mood', 'Low mood']];
const R = [['infl', 'Inflammation'], ['sugar', 'Blood-sugar swings'], ['digest', 'Weak digestion'], ['hormone', 'Hormone imbalance'], ['stress', 'Stress response']];
const T = [['food', 'Food triggers'], ['gut', 'Gut imbalance'], ['cstress', 'Chronic stress'], ['rhythm', 'Irregular meals and sleep']];
const SR = {
  bloat: ['digest', 'infl'],
  fatigue: ['sugar', 'digest'],
  skin: ['infl', 'hormone'],
  fog: ['infl', 'sugar'],
  sleep: ['stress', 'sugar'],
  cycle: ['hormone', 'stress'],
  mood: ['infl', 'stress']
};
const RT = {
  infl: ['gut', 'food'],
  sugar: ['rhythm'],
  digest: ['gut', 'food'],
  hormone: ['gut', 'cstress'],
  stress: ['cstress', 'rhythm']
};
const EXAMPLE = ['bloat', 'skin'];
const NAME = {};
[S, R, T].forEach(l => l.forEach(([id, n]) => {
  NAME[id] = n;
}));
const STEPS = [{
  h: 'It starts with what you feel.',
  p: 'Seven everyday complaints. Most people treat each one on its own: a cream for the skin, an antacid for the bloating, coffee for the fatigue.'
}, {
  h: 'Underneath, fewer things are going on.',
  p: 'Many symptoms share the same handful of processes. Inflammation, for example, can surface in the skin, the mood and the gut at once.'
}, {
  h: 'One level deeper, the lines converge.',
  p: 'Seven symptoms trace back to four places where problems often begin. Six of the seven paths pass through the gut.'
}, {
  h: 'Bloating and skin flare-ups seem unrelated.',
  p: 'Follow both down and they meet at gut imbalance and food triggers. That shared root is why treating the skin alone often doesn\u2019t last.'
}, {
  h: 'Now trace your own.',
  p: 'Tap the symptoms you live with and watch where they lead.'
}];

/* ---- canvas: our ivory-first stops, blended in oklab across section boundaries ---- */
const SECTION_CANVAS = ['--canvas-hero-from', '--canvas-descent-to', '--canvas-turn-to', '--canvas-close-to'];
function trace(set) {
  const r = new Set(),
    t = new Set();
  set.forEach(s => (SR[s] || []).forEach(x => {
    r.add(x);
    (RT[x] || []).forEach(y => t.add(y));
  }));
  return {
    r,
    t
  };
}
function useReducedMotion() {
  const [v, setV] = React.useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setV(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return v;
}

/* ---- the map: three layers of pills, bezier links measured from live geometry ---- */
function RootMap({
  step,
  selected,
  onToggle,
  reduced
}) {
  const mapRef = React.useRef(null);
  const nodeRefs = React.useRef({});
  const [paths, setPaths] = React.useState([]);
  const [box, setBox] = React.useState({
    w: 0,
    h: 0
  });
  const user = selected.size > 0;
  const showR = user || step >= 1;
  const showRoot = user || step >= 2;
  const focusSet = user ? selected : step === 3 ? new Set(EXAMPLE) : new Set();
  const tr = trace(focusSet);
  const focused = focusSet.size > 0;
  const measure = React.useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBoundingClientRect();
    const next = [];
    const edge = (a, cls) => k => {
      const ea = nodeRefs.current[a],
        eb = nodeRefs.current[k];
      if (!ea || !eb) return;
      const ra = ea.getBoundingClientRect(),
        rb = eb.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - b.left,
        y1 = ra.bottom - b.top;
      const x2 = rb.left + rb.width / 2 - b.left,
        y2 = rb.top - b.top;
      const my = (y1 + y2) / 2;
      next.push({
        key: cls + ':' + a + '-' + k,
        a,
        b: k,
        cls,
        d: 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + y2
      });
    };
    Object.keys(SR).forEach(s => SR[s].forEach(edge(s, 'sr')));
    Object.keys(RT).forEach(r => RT[r].forEach(edge(r, 'rt')));
    setBox({
      w: b.width,
      h: b.height
    });
    setPaths(next);
  }, []);
  React.useEffect(() => {
    measure();
    const ro = window.ResizeObserver ? new ResizeObserver(measure) : null;
    if (ro && mapRef.current) ro.observe(mapRef.current);
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, [measure]);
  React.useEffect(() => {
    measure();
  }, [step, selected, measure]);
  const layer = (name, list, visible, size, interactive) => /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(10px)',
      transition: 'opacity var(--dur-scene) var(--ease), transform var(--dur-scene) var(--ease)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 var(--sp-3)',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-quiet-light)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 'var(--sp-2)'
    }
  }, list.map(([id, lbl]) => {
    const isSel = selected.has(id);
    const lit = !isSel && (focusSet.has(id) || tr.r.has(id) || tr.t.has(id));
    let count;
    if (user && selected.size > 1 && tr.t.has(id)) {
      let n = 0;
      selected.forEach(s => {
        if (trace(new Set([s])).t.has(id)) n++;
      });
      count = n + ' of ' + selected.size;
    }
    return /*#__PURE__*/React.createElement("span", {
      key: id,
      ref: el => {
        nodeRefs.current[id] = el;
      },
      style: {
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement(SymptomNode, {
      label: lbl,
      note: count,
      size: size,
      tone: "light",
      selected: isSel,
      state: lit ? 'active' : focused && !isSel ? 'muted' : 'default',
      onClick: interactive ? () => onToggle(id) : undefined
    }));
  })));
  return /*#__PURE__*/React.createElement("div", {
    ref: mapRef,
    style: {
      position: 'relative',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(44px, 6vw, 84px)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: '0 0 ' + box.w + ' ' + box.h,
    width: box.w,
    height: box.h,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      overflow: 'visible',
      pointerEvents: 'none'
    }
  }, paths.map(p => {
    const on = p.cls === 'sr' ? showR : showRoot;
    const lit = p.cls === 'sr' ? focusSet.has(p.a) : tr.r.has(p.a) && tr.t.has(p.b);
    return /*#__PURE__*/React.createElement("path", {
      key: p.key,
      d: p.d,
      pathLength: "1",
      fill: "none",
      strokeLinecap: "round",
      stroke: lit ? 'var(--ember-a)' : 'var(--rule-on-light)',
      strokeWidth: lit ? 2.4 : 1.4,
      strokeDasharray: reduced ? undefined : 1,
      strokeDashoffset: reduced ? undefined : on ? 0 : 1,
      opacity: on ? focused && !lit ? 0.28 : 1 : reduced ? 0 : 1,
      style: {
        transition: 'stroke-dashoffset 1.1s var(--ease), stroke var(--dur-base), opacity var(--dur-base), stroke-width var(--dur-base)'
      }
    });
  })), layer('What you feel', S, true, 'sm', true), layer('What\u2019s happening underneath', R, showR, 'sm', false), layer('Where it often starts', T, showRoot, 'md', false));
}
function Summary({
  selected,
  onClear
}) {
  if (!selected.size) {
    return /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        color: 'var(--text-quiet-light)'
      }
    }, "Tap any symptom in the map to see where it can lead.");
  }
  const n = selected.size;
  const counts = T.map(([id, name]) => {
    let c = 0;
    selected.forEach(s => {
      if (trace(new Set([s])).t.has(id)) c++;
    });
    return {
      id,
      name,
      n: c
    };
  }).filter(c => c.n > 0).sort((a, b) => b.n - a.n);
  const shared = counts.filter(c => c.n === n);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 700
    }
  }, n, " symptom", n > 1 ? 's' : ''), " can trace back to", ' ', /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 700
    }
  }, counts.length, " possible root", counts.length > 1 ? 's' : ''), ".", n > 1 && shared.length ? ' Every one of them can lead to ' + shared.map(c => c.name.toLowerCase()).join(' and ') + '.' : ''), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none'
    }
  }, counts.map(c => /*#__PURE__*/React.createElement("li", {
    key: c.id,
    style: {
      padding: 'var(--sp-2) 0',
      borderTop: '1px solid var(--rule-on-light)',
      color: 'var(--text-quiet-light)',
      fontSize: 15
    }
  }, c.name, n > 1 ? ', linked to ' + c.n + ' of ' + n : ''))));
}
function App() {
  const reduced = useReducedMotion();
  const [step, setStep] = React.useState(0);
  const [selected, setSelected] = React.useState(() => new Set());
  const [canvas, setCanvas] = React.useState('var(' + SECTION_CANVAS[0] + ')');
  const [chat, setChat] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const [msgs, setMsgs] = React.useState([{
    from: 'guide',
    text: 'Tell me what your digestion has been like this week.'
  }]);
  const stepRefs = React.useRef([]);
  const sectionRefs = React.useRef([]);
  const toastTimer = React.useRef(0);
  const say = t => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };
  const toggle = id => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  React.useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const vh = window.innerHeight,
        mobile = window.innerWidth < 900;
      const line = vh * (mobile ? 0.82 : 0.55);
      let active = 0;
      stepRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < line) active = i;
      });
      setStep(active);

      // blend the canvas across each section boundary over a 0.8-screen window
      const probe = vh * 0.5;
      let color = 'var(' + SECTION_CANVAS[0] + ')';
      for (let j = 0; j < sectionRefs.current.length - 1; j++) {
        const nextEl = sectionRefs.current[j + 1];
        if (!nextEl) break;
        const t = (probe - (nextEl.getBoundingClientRect().top - vh * 0.4)) / (vh * 0.8);
        if (t >= 1) {
          color = 'var(' + SECTION_CANVAS[j + 1] + ')';
          continue;
        }
        if (t > 0) {
          const e = reduced ? t > 0.5 ? 1 : 0 : t * t * (3 - 2 * t);
          color = 'color-mix(in oklab, var(' + SECTION_CANVAS[j + 1] + ') ' + (e * 100).toFixed(1) + '%, var(' + SECTION_CANVAS[j] + '))';
        }
        break;
      }
      setCanvas(color);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "canvas-root",
    style: {
      background: canvas
    }
  }), /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 20,
      padding: 'var(--sp-5) var(--gutter-mobile)'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    name: "[BRAND NAME]",
    tone: "light"
  })), /*#__PURE__*/React.createElement("main", {
    id: "top"
  }, /*#__PURE__*/React.createElement("section", {
    ref: el => {
      sectionRefs.current[0] = el;
    },
    "data-screen-label": "intro",
    className: "sec",
    style: {
      position: 'relative',
      zIndex: 1,
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--sp-32) var(--gutter-mobile) var(--sp-40)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--fs-display-xl)',
      lineHeight: 1.02,
      letterSpacing: 'var(--ls-display)',
      maxWidth: '14ch',
      textWrap: 'balance'
    }
  }, "Different symptoms often grow from the same roots."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-8) 0 0',
      maxWidth: '44ch',
      fontSize: 'var(--fs-body-l)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-quiet-light)'
    }
  }, "Scroll to see how what you feel on the surface connects to where it often starts."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-12) 0 0',
      maxWidth: '52ch',
      fontSize: 14,
      lineHeight: 1.55,
      color: 'var(--text-quiet-light)',
      paddingLeft: 'var(--sp-4)',
      borderLeft: '2px solid var(--ember-a)'
    }
  }, "Prototype. Every connection on this map is a draft for the Ease Disease clinical team to review and replace."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-16) 0 0',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-quiet-light)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cue"
  }), " Scroll down")), /*#__PURE__*/React.createElement("section", {
    ref: el => {
      sectionRefs.current[1] = el;
    },
    "data-screen-label": "root map",
    "aria-label": "The root map",
    className: "scrolly",
    style: {
      position: 'relative',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "map-wrap"
  }, /*#__PURE__*/React.createElement(RootMap, {
    step: step,
    selected: selected,
    onToggle: toggle,
    reduced: reduced
  })), /*#__PURE__*/React.createElement("div", {
    className: "steps"
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    ref: el => {
      stepRefs.current[i] = el;
    },
    className: 'step' + (i === STEPS.length - 1 ? ' last' : '')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '40ch',
      opacity: step === i ? 1 : 0.35,
      transition: 'opacity var(--dur-base) var(--ease)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--fs-display-m)',
      lineHeight: 1.12,
      letterSpacing: 'var(--ls-display)'
    }
  }, s.h), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-4) 0 0',
      color: 'var(--text-quiet-light)',
      lineHeight: 'var(--lh-body)'
    }
  }, s.p), i === STEPS.length - 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--sp-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-live": "polite",
    style: {
      minHeight: '3.2em'
    }
  }, /*#__PURE__*/React.createElement(Summary, {
    selected: selected
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--sp-3)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(CtaPill, {
    label: "Find my roots in a consultation",
    onClick: () => say('The booking flow is the next prototype.')
  }), selected.size ? /*#__PURE__*/React.createElement(CtaPill, {
    label: "Clear my symptoms",
    variant: "ghostDark",
    onClick: () => setSelected(new Set())
  }) : null)) : null))))), /*#__PURE__*/React.createElement("section", {
    ref: el => {
      sectionRefs.current[2] = el;
    },
    id: "book",
    "data-screen-label": "close",
    className: "sec",
    style: {
      position: 'relative',
      zIndex: 1,
      minHeight: '92svh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--sp-32) var(--gutter-mobile) var(--sp-40)'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    tone: "light",
    count: "03",
    rule: true
  }, "The close"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 'var(--sp-5) 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--fs-display-l)',
      lineHeight: 1.05,
      letterSpacing: 'var(--ls-display)',
      maxWidth: '17ch',
      textWrap: 'balance'
    }
  }, "The map shows the pattern. Your consultation finds your roots."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-6) 0 0',
      maxWidth: '46ch',
      fontSize: 'var(--fs-body-l)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-quiet-light)'
    }
  }, "In 30 minutes you tell us your whole story, and you leave knowing where to start. The first call is \u20B9499."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--sp-10)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement(CtaPill, {
    label: "Book a consultation",
    compact: true,
    meta: "30 min \xB7 \u20B9499",
    onClick: () => say('The booking flow is the next prototype.')
  }), /*#__PURE__*/React.createElement(CtaPill, {
    label: "Ask the Ease guide first",
    variant: "ghostDark",
    onClick: () => setChat(true)
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--sp-16) 0 0',
      fontSize: 14,
      lineHeight: 1.55,
      maxWidth: '52ch',
      color: 'var(--text-quiet-light)'
    }
  }, "This map shows common patterns, not a diagnosis. Please speak to a qualified practitioner about your own health.")), /*#__PURE__*/React.createElement("section", {
    ref: el => {
      sectionRefs.current[3] = el;
    },
    "data-screen-label": "footer",
    style: {
      position: 'relative',
      zIndex: 1,
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--gutter-mobile) var(--sp-16)'
    }
  }, /*#__PURE__*/React.createElement(FooterClose, {
    body: "[CLOSING LINE]",
    onBook: () => say('The booking flow is the next prototype.')
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 'var(--gutter-mobile)',
      bottom: 'var(--sp-5)',
      zIndex: 20,
      display: 'flex',
      gap: 'var(--sp-3)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(ChatBubble, {
    unread: !chat,
    open: chat,
    onClick: () => setChat(v => !v)
  }), /*#__PURE__*/React.createElement(CtaPill, {
    label: "Book a consultation",
    compact: true,
    meta: "30 min \xB7 \u20B9499",
    onClick: () => say('The booking flow is the next prototype.')
  })), chat ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 'var(--gutter-mobile)',
      bottom: 'calc(var(--sp-5) + 64px)',
      zIndex: 42
    }
  }, /*#__PURE__*/React.createElement(ChatPanel, {
    open: true,
    title: "Ease guide",
    messages: msgs,
    quickReplies: ['Bloating', 'Skin flare-ups', 'Book Level 1'],
    onClose: () => setChat(false),
    onQuickReply: q => setMsgs(m => [...m, {
      from: 'user',
      text: q
    }, {
      from: 'guide',
      text: '[GUIDE REPLY PLACEHOLDER]'
    }]),
    onSend: t => setMsgs(m => [...m, {
      from: 'user',
      text: t
    }, {
      from: 'guide',
      text: '[GUIDE REPLY PLACEHOLDER]'
    }])
  })) : null, /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      position: 'fixed',
      left: '50%',
      bottom: 'calc(92px + var(--sp-2))',
      zIndex: 30,
      transform: toast ? 'translate(-50%,0)' : 'translate(-50%,20px)',
      opacity: toast ? 1 : 0,
      pointerEvents: 'none',
      maxWidth: 'calc(100% - 40px)',
      background: 'var(--surface-deep)',
      color: 'var(--ivory)',
      padding: 'var(--sp-3) var(--sp-5)',
      borderRadius: 'var(--r-sm)',
      fontSize: 14,
      boxShadow: 'var(--shadow-lift)',
      transition: 'opacity var(--dur-base), transform var(--dur-base) var(--ease)'
    }
  }, toast));
}
Object.assign(window, {
  App
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/root-map/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/scrollytelling/scrollytelling.app.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DS = window.EaseDiseaseDesignSystem_ab9856 || {};
const NEEDED = ['Wordmark', 'CtaPill', 'ChatBubble', 'ChatPanel', 'MenuDot', 'MenuOverlay', 'EyebrowLabel', 'DisplayBlock', 'EvidenceTick', 'SymptomNode', 'Thread', 'LevelCard', 'TeamCard', 'FooterClose'];
const MISSING = NEEDED.filter(n => typeof DS[n] !== 'function');
const {
  Wordmark,
  CtaPill,
  ChatBubble,
  ChatPanel,
  MenuDot,
  MenuOverlay,
  EyebrowLabel,
  DisplayBlock,
  EvidenceTick,
  SymptomNode,
  Thread,
  LevelCard,
  TeamCard,
  FooterClose
} = DS;

// A stale or partial bundle must fail loudly, not as a blank ivory page.
function MissingBundle() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-4)',
      justifyContent: 'center',
      padding: 'var(--sp-12) var(--gutter-mobile)',
      maxWidth: 'var(--container-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--ember-a)'
    }
  }, "Bundle out of date"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 400,
      fontSize: 'var(--fs-display-m)',
      lineHeight: 1.05,
      letterSpacing: 'var(--ls-display)'
    }
  }, "This page needs components that are not in _ds_bundle.js yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body-m)',
      lineHeight: 'var(--lh-body)',
      maxWidth: 'var(--measure-body)',
      color: 'var(--text-quiet-light)'
    }
  }, "Reload once the bundle has been recompiled. Missing exports:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 'var(--sp-5)',
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      lineHeight: 1.7
    }
  }, MISSING.map(n => /*#__PURE__*/React.createElement("li", {
    key: n
  }, n))), DS.__errors && DS.__errors.length ? /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap',
      color: 'var(--text-quiet-light)'
    }
  }, JSON.stringify(DS.__errors, null, 2)) : null);
}

/* ---------- canvas ---------- */
// One fixed canvas. Its colour is mixed in oklab between the two nearest stops,
// driven linearly by page progress. Positions match guidelines/canvas-journey.html.
const CANVAS_STOPS = [[0.00, '--canvas-hero-from'], [0.14, '--canvas-hero-to'], [0.28, '--canvas-hook-to'], [0.44, '--canvas-descent-to'], [0.52, '--canvas-turn-mid'], [0.60, '--canvas-turn-to'], [0.74, '--canvas-levels-to'], [0.87, '--canvas-team-to'], [1.00, '--canvas-close-to']];
function canvasColor(p, reduced) {
  let i = 0;
  while (i < CANVAS_STOPS.length - 2 && p > CANVAS_STOPS[i + 1][0]) i++;
  const [aAt, aVar] = CANVAS_STOPS[i];
  const [bAt, bVar] = CANVAS_STOPS[i + 1];
  if (reduced) return 'var(' + (p - aAt < bAt - p ? aVar : bVar) + ')';
  const f = Math.min(1, Math.max(0, (p - aAt) / (bAt - aAt)));
  return 'color-mix(in oklab, var(' + aVar + ') ' + ((1 - f) * 100).toFixed(2) + '%, var(' + bVar + '))';
}

/* ---------- scroll plumbing ---------- */
function useReducedMotion() {
  const [r, setR] = React.useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

// Page progress 0..1 plus a per-scene progress map, recomputed on a rAF-throttled scroll.
function useScroll(sceneIds) {
  const [state, setState] = React.useState({
    page: 0,
    scenes: {}
  });
  React.useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const page = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const scenes = {};
      for (const id of sceneIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        scenes[id] = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) // pinned scene
        : Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      }
      setState({
        page,
        scenes
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sceneIds.join('|')]);
  return state;
}
const SCENES = ['hero', 'hook', 'descent', 'turn', 'levels', 'team', 'close'];
function Scene({
  id,
  children,
  tall,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    "data-screen-label": id,
    style: {
      position: 'relative',
      zIndex: 1,
      minHeight: tall ? 'var(--pin-max)' : 'var(--scene-min-height)',
      padding: '0 var(--gutter-mobile)',
      ...style
    }
  }, children);
}
function Inner({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      width: '100%',
      ...style
    }
  }, children);
}

/* ---------- scenes ---------- */
const DYSFUNCTIONS = [{
  label: '[SYMPTOM 1]',
  note: '[SYSTEM]'
}, {
  label: '[SYMPTOM 2]',
  note: '[SYSTEM]'
}, {
  label: '[SYMPTOM 3]',
  note: '[SYSTEM]'
}, {
  label: '[SYMPTOM 4]',
  note: '[SYSTEM]'
}];
function Hero({
  p
}) {
  return /*#__PURE__*/React.createElement(Inner, {
    style: {
      minHeight: 'var(--scene-min-height)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 'var(--sp-10)',
      paddingTop: 'var(--sp-24)',
      paddingBottom: 'var(--sp-16)'
    }
  }, /*#__PURE__*/React.createElement(DisplayBlock, {
    tone: "light",
    size: "xl",
    eyebrow: "Digestion first",
    count: "01",
    headline: "Your gut is where most chronic symptoms begin",
    highlight: "most chronic symptoms",
    body: "A digestion-first functional medicine practice. We work back from the symptom to the cause, in plain language."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(SymptomNode, {
    center: true,
    size: "lg",
    label: "Digestion"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 'var(--sp-4)',
      width: '100%'
    }
  }, DYSFUNCTIONS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(Thread, {
    orientation: "vertical",
    length: 56,
    curve: i % 2 ? 10 : -10,
    progress: Math.min(1, Math.max(0, p * 4 - i * 0.5))
  }), /*#__PURE__*/React.createElement(SymptomNode, {
    label: d.label,
    note: d.note,
    state: p * 4 - i * 0.5 > 0.8 ? 'active' : 'muted'
  }))))));
}
const COMPARE = [{
  k: 'Conventional',
  v: '[CONVENTIONAL APPROACH]'
}, {
  k: 'Root cause',
  v: '[ROOT CAUSE APPROACH]'
}];
function Hook() {
  return /*#__PURE__*/React.createElement(Inner, {
    style: {
      minHeight: 'var(--scene-min-height)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 'var(--sp-10)',
      padding: 'var(--sp-20) 0'
    }
  }, /*#__PURE__*/React.createElement(DisplayBlock, {
    tone: "light",
    size: "l",
    eyebrow: "The hook",
    count: "02",
    headline: "What your doctors will not tell you",
    body: "Symptom management and root-cause work are different jobs. Here is the difference, without the jargon."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
      gap: 'var(--sp-4)'
    }
  }, COMPARE.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.k,
    style: {
      background: 'var(--ivory)',
      border: '1px solid var(--rule-on-light)',
      borderRadius: 'var(--r-lg)',
      padding: 'var(--sp-6)',
      boxShadow: 'var(--shadow-soft)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    tone: "light",
    rule: true
  }, c.k), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.55,
      color: 'var(--text-quiet-light)'
    }
  }, c.v)))), /*#__PURE__*/React.createElement(EvidenceTick, {
    tone: "light",
    source: "[CREDENTIAL SOURCE]"
  }, "[EVIDENCE CLAIM]"));
}
const ROOTS = [{
  label: '[ROOT CAUSE 1]',
  note: '[MECHANISM]'
}, {
  label: '[ROOT CAUSE 2]',
  note: '[MECHANISM]'
}, {
  label: '[ROOT CAUSE 3]',
  note: '[MECHANISM]'
}];

// Pinned vertical scene: the thread descends through the root causes as you scroll.
function Descent({
  p
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      height: '100svh',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Inner, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
      gap: 'var(--sp-8)',
      alignItems: 'center',
      padding: 'var(--sp-12) 0'
    }
  }, /*#__PURE__*/React.createElement(DisplayBlock, {
    tone: "light",
    size: "m",
    eyebrow: "The descent",
    count: "03",
    headline: "Root causes run deeper than symptoms",
    body: "Scroll down and the thread keeps going. Every layer below is something a symptom-first visit never reaches."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-deep)',
      color: 'var(--ivory)',
      borderRadius: 'var(--r-xl)',
      padding: 'var(--sp-8)',
      boxShadow: 'var(--shadow-lift)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-quiet-dark)',
      marginBottom: 'var(--sp-4)'
    }
  }, Math.round(p * 100), "% descended"), ROOTS.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-1)'
    }
  }, /*#__PURE__*/React.createElement(SymptomNode, {
    tone: "dark",
    label: r.label,
    note: r.note,
    state: p * 3 - i > 0.25 ? 'active' : 'muted'
  }), i < ROOTS.length - 1 ? /*#__PURE__*/React.createElement(Thread, {
    tone: "dark",
    orientation: "vertical",
    length: 44,
    curve: i % 2 ? 6 : -6,
    progress: Math.min(1, Math.max(0, p * 3 - i))
  }) : null)))));
}
function Turn() {
  return /*#__PURE__*/React.createElement(Inner, {
    style: {
      minHeight: 'var(--scene-min-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-24) 0'
    }
  }, /*#__PURE__*/React.createElement(DisplayBlock, {
    tone: "light",
    size: "xl",
    align: "center",
    eyebrow: "The turn",
    count: "04",
    headline: "Root-cause healing begins here"
  }));
}
const LEVELS = [{
  index: '01',
  state: 'bookable',
  name: '[LEVEL 1 NAME]',
  description: '[LEVEL 1 DESCRIPTION]',
  duration: '30 min',
  price: '₹499',
  bullets: ['[WHAT IS COVERED]', '[WHAT YOU LEAVE WITH]']
}, {
  index: '02',
  state: 'later',
  name: '[LEVEL 2 NAME]',
  description: '[LEVEL 2 DESCRIPTION]'
}, {
  index: '03',
  state: 'later',
  name: '[LEVEL 3 NAME]',
  description: '[LEVEL 3 DESCRIPTION]'
}, {
  index: '04',
  state: 'later',
  name: '[LEVEL 4 NAME]',
  description: '[LEVEL 4 DESCRIPTION]'
}];

// Pinned HORIZONTAL scene: vertical scroll is remapped to sideways travel along the rail.
function Levels({
  p,
  reduced,
  onBook
}) {
  const active = Math.min(LEVELS.length - 1, Math.floor(p * LEVELS.length + 0.001));
  if (reduced) {
    return /*#__PURE__*/React.createElement(Inner, {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        gap: 'var(--sp-4)',
        padding: 'var(--sp-16) 0'
      }
    }, LEVELS.map(l => /*#__PURE__*/React.createElement(LevelCard, _extends({
      key: l.index
    }, l, {
      onBook: onBook
    }))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      height: '100svh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement(Inner, {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--sp-5)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(EyebrowLabel, {
    tone: "light",
    count: "05",
    rule: true
  }, "The levels"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--text-quiet-light)'
    }
  }, "Keep scrolling \u2014 this one moves sideways")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--sp-5)',
      padding: '0 var(--gutter-mobile)',
      width: 'max-content',
      transform: 'translate3d(' + -p * 62 + 'vw,0,0)',
      transition: 'transform 80ms linear'
    }
  }, LEVELS.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: l.index,
    style: {
      width: 'min(78vw, 340px)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(LevelCard, _extends({}, l, {
    active: i === active,
    onBook: onBook
  }))))), /*#__PURE__*/React.createElement(Inner, {
    style: {
      display: 'flex',
      gap: 'var(--sp-2)',
      alignItems: 'center'
    }
  }, LEVELS.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: l.index,
    style: {
      height: 2,
      flex: 1,
      borderRadius: 'var(--r-pill)',
      background: i <= active ? 'var(--ember-a)' : 'var(--rule-on-light)',
      transition: 'background var(--dur-base) var(--ease)'
    }
  }))));
}
const TEAM = [{
  name: 'Carol',
  credential: '[CREDENTIAL]',
  role: 'Founder'
}, {
  name: 'Deepa',
  credential: '[CREDENTIAL]',
  role: 'Founder'
}, {
  name: 'Dr. Akshai Kolagani',
  credential: '[CREDENTIAL]',
  role: '[ROLE]'
}];
function Team() {
  return /*#__PURE__*/React.createElement(Inner, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)',
      padding: 'var(--sp-20) 0'
    }
  }, /*#__PURE__*/React.createElement(DisplayBlock, {
    tone: "light",
    size: "l",
    eyebrow: "Clinical rigor",
    count: "06",
    headline: "The people who read your case",
    body: "Every credential here carries an evidence tick, so it has to be verifiable."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
      gap: 'var(--sp-4)'
    }
  }, TEAM.map(t => /*#__PURE__*/React.createElement(TeamCard, _extends({
    key: t.name
  }, t)))));
}

/* ---------- app ---------- */
function App() {
  if (MISSING.length) return /*#__PURE__*/React.createElement(MissingBundle, null);
  const reduced = useReducedMotion();
  const {
    page,
    scenes
  } = useScroll(SCENES);
  const [menu, setMenu] = React.useState(false);
  const [chat, setChat] = React.useState(false);
  const [msgs, setMsgs] = React.useState([{
    from: 'guide',
    text: 'Tell me what your digestion has been like this week.'
  }]);
  const book = () => {
    setChat(true);
    setMsgs(m => [...m, {
      from: 'guide',
      text: 'Level 1 is 30 minutes for ₹499. [BOOKING FLOW PLACEHOLDER]'
    }]);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "canvas-root",
    style: {
      background: canvasColor(page, reduced)
    }
  }), /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 45,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--sp-5) var(--gutter-mobile)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    name: "[BRAND NAME]",
    tone: "light"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement(MenuDot, {
    open: menu,
    tone: "dark",
    onClick: () => setMenu(v => !v)
  }))), /*#__PURE__*/React.createElement(Scene, {
    id: "hero"
  }, /*#__PURE__*/React.createElement(Hero, {
    p: scenes.hero || 0
  })), /*#__PURE__*/React.createElement(Scene, {
    id: "hook"
  }, /*#__PURE__*/React.createElement(Hook, null)), /*#__PURE__*/React.createElement(Scene, {
    id: "descent",
    tall: true
  }, /*#__PURE__*/React.createElement(Descent, {
    p: scenes.descent || 0
  })), /*#__PURE__*/React.createElement(Scene, {
    id: "turn"
  }, /*#__PURE__*/React.createElement(Turn, null)), /*#__PURE__*/React.createElement(Scene, {
    id: "levels",
    tall: !reduced,
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Levels, {
    p: scenes.levels || 0,
    reduced: reduced,
    onBook: book
  })), /*#__PURE__*/React.createElement(Scene, {
    id: "team",
    style: {
      minHeight: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Team, null)), /*#__PURE__*/React.createElement(Scene, {
    id: "close",
    style: {
      minHeight: 'auto',
      paddingBottom: 'var(--sp-16)'
    }
  }, /*#__PURE__*/React.createElement(Inner, null, /*#__PURE__*/React.createElement(FooterClose, {
    body: "[CLOSING LINE]",
    onBook: book
  }))), /*#__PURE__*/React.createElement(CtaPill, {
    floating: true,
    compact: true,
    meta: "30 min \xB7 \u20B9499",
    onClick: book
  }), /*#__PURE__*/React.createElement(ChatBubble, {
    unread: !chat,
    open: chat,
    offsetRight: "calc(var(--sp-6) + 320px)",
    onClick: () => setChat(v => !v)
  }), chat ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 'var(--sp-6)',
      bottom: 'calc(var(--sp-6) + 64px)',
      zIndex: 42
    }
  }, /*#__PURE__*/React.createElement(ChatPanel, {
    open: true,
    title: "Ease guide",
    messages: msgs,
    quickReplies: ['Bloating', 'Acidity', 'Book Level 1'],
    onClose: () => setChat(false),
    onQuickReply: q => setMsgs(m => [...m, {
      from: 'user',
      text: q
    }, {
      from: 'guide',
      text: '[GUIDE REPLY PLACEHOLDER]'
    }]),
    onSend: t => setMsgs(m => [...m, {
      from: 'user',
      text: t
    }, {
      from: 'guide',
      text: '[GUIDE REPLY PLACEHOLDER]'
    }])
  })) : null, /*#__PURE__*/React.createElement(MenuOverlay, {
    open: menu,
    onClose: () => setMenu(false)
  }));
}
Object.assign(window, {
  App
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/scrollytelling/scrollytelling.app.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CtaPill = __ds_scope.CtaPill;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.ChatBubble = __ds_scope.ChatBubble;

__ds_ns.ChatPanel = __ds_scope.ChatPanel;

__ds_ns.DisplayBlock = __ds_scope.DisplayBlock;

__ds_ns.EvidenceTick = __ds_scope.EvidenceTick;

__ds_ns.EyebrowLabel = __ds_scope.EyebrowLabel;

__ds_ns.MenuDot = __ds_scope.MenuDot;

__ds_ns.MenuOverlay = __ds_scope.MenuOverlay;

__ds_ns.SymptomNode = __ds_scope.SymptomNode;

__ds_ns.Thread = __ds_scope.Thread;

__ds_ns.FooterClose = __ds_scope.FooterClose;

__ds_ns.LevelCard = __ds_scope.LevelCard;

__ds_ns.TeamCard = __ds_scope.TeamCard;

})();
