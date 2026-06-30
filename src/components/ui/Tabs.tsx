import type { ReactNode } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import styles from './Tabs.module.css'

export interface TabItem {
  value: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  defaultValue: string
  items: TabItem[]
}

export function Tabs({ defaultValue, items }: TabsProps) {
  return (
    <RadixTabs.Root defaultValue={defaultValue}>
      <RadixTabs.List className={styles.list}>
        {items.map((item) => (
          <RadixTabs.Trigger key={item.value} value={item.value} className={styles.trigger}>
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value}>
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
