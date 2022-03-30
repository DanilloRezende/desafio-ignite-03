import  Link  from "next/link"
import styles from "./header.module.scss"

export default function Header() {
  return (
    <header >
      <div className={styles.headerContainer}> 
        <nav className={styles.headerLogo}>
          <Link href="/">
          <a >
          <img src="/image/Logo.svg" alt="logo" />
          </a>
          </Link>
        </nav>
      </div>  
        
      
    </header>
  )
  
}
