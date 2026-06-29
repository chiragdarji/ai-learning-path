import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function Card({ interactive, className, ...props }: CardProps) {
  return (
    <div
      data-interactive={interactive ? 'true' : undefined}
      className={`${styles.card} ${className ?? ''}`.trim()}
      {...props}
    />
  )
}
