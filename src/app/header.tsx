import naftal_logo from './lib/Logo_NAFTAL.svg';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-[12vh] bg-[#D3D31B] flex justify-between items-center">

      <div>
      </div>


      <div className="flex items-center p-1">
        <img src={naftal_logo.src} alt="Naftal Logo" className="h-16 w-auto" />
      </div>
    </header>
  );
}