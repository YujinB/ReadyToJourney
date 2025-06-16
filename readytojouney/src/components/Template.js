import Header from "./Header"
import Footer from "./Footer"

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