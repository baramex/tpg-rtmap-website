import Footer from "../Layout/Footer";
import Header from "../Layout/Header";
import Map from "../Map/Map";
import { HourDisplay } from "../Misc/Hour";

export default function Home(props) {
    return (<>
        <Header {...props} />

        <div className="px-6">
            <h2 className="py-6 text-lg font-semibold">Liste des transports actuellement en circulation:</h2>
            <HourDisplay />
            <div className="max-h-[42rem] overflow-x-hidden overflow-y-auto mt-4 w-fit pr-4">
                {/*<TripList {...props} />*/}
            </div>
        </div>

        <div className="max-w-7xl h-[46rem]">
            <Map {...props} />
        </div>

        <Footer {...props} />
    </>)
}