import styles from "./Header.module.css"
import { Link } from "react-router-dom";

function header() {
    return(
        <div className={styles.wrapper}>
        <div className={styles.inner}>
            <Link to="/" className={`${styles.title} ${styles.noUnderline}`}>
                <p>Ready To Journey</p>
            </Link>
            <div className={styles.page}>
                <Link to="/" className={styles.noUnderline}>
                    <p>Calendar</p>
                </Link>
                <Link to="/financial" className={styles.noUnderline}>
                    <p>Financial</p>
                </Link>
                <Link to="/" className={styles.noUnderline}>
                    <p>Mypage</p>
                </Link> 
            </div>
        </div>
        </div>
    );
}
export default header;