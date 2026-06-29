import type { HTMLAttributes } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      data-tone={tone}
      className={`${styles.badge} ${className ?? ''}`.trim()}
      {...props}
    />
  )
}
