import React from 'react'
import { motion } from 'framer-motion'

type JobCardProps = {
  id?: string | number
  imageSrc?: string
  title: string
  pay?: string
  onSwipe?: (dir: 'left' | 'right') => void
  className?: string
}

export function JobCard({ id, imageSrc, title, pay = '', onSwipe, className = '' }: JobCardProps) {
  function handleDragEnd(event: any, info: any) {
    const offset = info.offset.x
    const velocity = info.velocity.x
    const swipe = offset + velocity * 20
    if (swipe > 150) onSwipe && onSwipe('right')
    else if (swipe < -150) onSwipe && onSwipe('left')
  }

  return (
    <motion.article
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={[
        'bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md',
        'border border-gray-100',
        'flex flex-col md:flex-row',
        className,
      ].join(' ')}
      role="group"
      aria-labelledby={id ? `job-${id}-title` : undefined}
    >
      <div className="shrink-0 w-full md:w-40 h-40 md:h-auto">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div className="p-4 flex-1">
        <h3 id={id ? `job-${id}-title` : undefined} className="text-lg font-semibold text-text">
          {title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">{pay}</div>
          <div className="ml-3 inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-semibold px-2 py-1">
            +15%
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default JobCard
