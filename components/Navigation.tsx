'use client'

export default function Navigation() {
  const icons = [
    { name: 'search', icon: '🔍' },
    { name: 'map', icon: '🗺️' },
    { name: 'notification', icon: '🔔' },
    { name: 'settings', icon: '⚙️' }
  ]

  return (
    <div className="flex justify-center mb-8">
      <div className="glass rounded-full px-6 py-3 flex items-center gap-6">
        {icons.map((item, index) => (
          <button
            key={index}
            className="w-10 h-10 flex items-center justify-center text-xl hover:scale-110 transition-transform"
            aria-label={item.name}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

