// Componentes UI compartidos — paleta terrosa Entrevelas.

export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-[#efe7dd] ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, sub, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-coffee leading-tight">{children}</h1>
        {sub && <p className="text-sm text-ink/60 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }) {
  const variants = {
    primary: 'bg-coffee text-cream hover:bg-[#4a3024]',
    amber: 'bg-amber text-white hover:bg-[#b3672f]',
    sage: 'bg-sage text-white hover:bg-[#6a8d6e]',
    ghost: 'bg-transparent text-coffee hover:bg-coffee/5 border border-[#e3d8cc]',
    danger: 'bg-alert text-white hover:bg-[#a5322a]',
    subtle: 'bg-[#f1e9df] text-coffee hover:bg-[#e8ddcf]',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-[#f1e9df] text-ink/70',
    green: 'bg-sage/15 text-[#4d7152]',
    amber: 'bg-amber/15 text-[#a35a23]',
    red: 'bg-alert/15 text-alert',
    coffee: 'bg-coffee/10 text-coffee',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function Field({ label, children, hint, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-xs font-semibold text-ink/60 mb-1 uppercase tracking-wide">{label}</span>}
      {children}
      {hint && <span className="block text-xs text-ink/45 mt-1">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-xl border border-[#e3d8cc] bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition'

export function Input(props) {
  return <input {...props} className={`${inputBase} ${props.className || ''}`} />
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputBase} ${props.className || ''}`}>
      {children}
    </select>
  )
}

export function Textarea(props) {
  return <textarea {...props} className={`${inputBase} resize-y min-h-[72px] ${props.className || ''}`} />
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-sage' : 'bg-[#d8cabd]'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
      {label && <span className="text-sm text-ink/80">{label}</span>}
    </button>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <span className="h-5 w-5 rounded-md border-2 border-[#d8cabd] peer-checked:bg-sage peer-checked:border-sage flex items-center justify-center text-white text-xs transition">
        {checked && '✓'}
      </span>
      {label && <span className="text-sm text-ink/80">{label}</span>}
    </label>
  )
}

export function Stat({ label, value, sub, tone = 'coffee', icon }) {
  const toneText = { coffee: 'text-coffee', amber: 'text-amber', sage: 'text-[#4d7152]', red: 'text-alert' }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className={`font-display text-3xl mt-2 ${toneText[tone]}`}>{value}</div>
      {sub && <div className="text-sm text-ink/55 mt-1">{sub}</div>}
    </Card>
  )
}

export function EmptyState({ icon = '🕯️', title, sub }) {
  return (
    <div className="text-center py-12 text-ink/50">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium text-ink/70">{title}</p>
      {sub && <p className="text-sm mt-1">{sub}</p>}
    </div>
  )
}
