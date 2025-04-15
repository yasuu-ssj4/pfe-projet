import naftal_logo from "./lib/Logo_NAFTAL.svg"

export default function Header() {
  return (
    <div className="flex items-center gap-4 sticky top-0 bg-white p-4 shadow-md font-semibold w-full">
      
      <div>
      </div>

    
      <div className="flex items-center p-1">
        <img src={naftal_logo.src} alt="Naftal Logo" className="h-16 w-auto" />
      </div>
    </div>
  );
}