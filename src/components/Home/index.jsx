import Footer from "../Layout/Footer";
import Header from "../Layout/Header";

export default function Home(props) {
    return (<>
        <Header {...props} />

        <h1>Home</h1>

        <Footer {...props} />
    </>)
}