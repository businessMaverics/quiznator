export default function Loading() {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h1 className="text-white font-cinzel tracking-widest text-xl animate-pulse">D'MAVERICS QUIZNATOR</h1>
            </div>
        </div>
    );
}
