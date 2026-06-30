import type { ReactNode } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import styles from './Dropdown.module.css'

export interface DropdownItem {
  label: string
  onSelect: () => void
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
}

export function Dropdown({ trigger, items }: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger className={styles.trigger}>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className={styles.content} sideOffset={4}>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              className={styles.item}
              onSelect={item.onSelect}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
