import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: string
  height?: string
}

export function Skeleton({ width = '100%', height = '1rem' }: SkeletonProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={styles.skeleton}
      style={{ width, height }}
    />
  )
}
