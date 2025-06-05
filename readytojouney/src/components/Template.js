import Header from "./Header"
import Footer from "./Footer"
import styles from "./Template.module.css"

const Template = ({ children }) => {
    return (
        <div>
            <div>
               <Header/>
                {children}
                <Footer/>
            </div>
        </div>
        
    )
}

export default Template