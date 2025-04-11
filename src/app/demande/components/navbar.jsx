import Image from "next/image";
import React from "react";
import {image} from "../../../../public/naftal.png"
function Navbar() {
  return (
    <>
      {/* version web */}
      <div className="flex items-center gap-4 sticky top-0 bg-white p-4 shadow-md font-semibold w-full">
        <Image
          src="image"
          alt="logo naftal"
          className="mr-auto"
          width={50}
          height={50}
        />
        <p>Accueil</p>
        <p>Infos</p>
        <p>Demande d'intervention</p>
        <p>Liste de vehicule</p>
      </div>
    </>
  );
}

export default Navbar;
