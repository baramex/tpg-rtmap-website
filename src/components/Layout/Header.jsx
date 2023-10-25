import large_logo from "../../images/large_logo.png";

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 p-4 flex justify-center">
            <div className="max-w-7xl w-full grid grid-cols-3 items-center">
                <img className="w-24" alt="tpg" src={large_logo} />
                <h1 className="gray-800 text-center text-xl font-semibold">Carte en temps réel</h1>
            </div>
        </header>
    );
}