import React from 'react'
import Image from 'next/image'
import Menu from '../Menu/Menu'
import styles from './header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <Image
        className={styles.logo}
        src="/logo.png"
        alt="Solution habitation logo"
        width={100}
        height={100}
        priority
      />
        <h1 className={styles.h1}> Solution <span className={styles.span}> Habitation </span>   </h1>
        <Menu />
    </header>
  )
}
