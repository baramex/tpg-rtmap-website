import Footer from "../Layout/Footer";
import Header from "../Layout/Header";
import TripList from "../Trip/TripList";
import { HourDisplay } from "../Misc/Hour";

export default function Home(props) {
    return (<>
        <Header {...props} />

        <div className="max-w-7xl px-6">
            <h2 className="py-6 text-lg font-semibold">Liste des transports actuellement en circulation:</h2>
            <HourDisplay />
            <div className="max-h-[42rem] overflow-y-auto mt-4">
                <TripList {...props} />
            </div>
        </div>

        <Footer {...props} />
    </>)
}