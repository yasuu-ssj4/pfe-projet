"use client";
import { useEffect, useState } from "react";

type Vehiculetype = {
  code_vehicule: string;
  code_structure: string;
  type_designation: string;
  marque_designation: string;
  status_designation: string | null;
  total_kilometrage: number;
};

export default function AfficheVehicule({ userId }: { userId: number }) {
  const [vehicules, setVehicules] = useState<Vehiculetype[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVehicules = async () => {
      const res = await fetch("/api/vehicule/getVehicules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: userId }),
      });
      const data: Vehiculetype[] = await res.json();
      setVehicules(data);
    };

    fetchVehicules();
  }, [userId]);

  const totalPages = Math.ceil(vehicules.length / itemsPerPage);

  const currentItems = vehicules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
           Liste des Véhicules
        </h1>

        <div className="overflow-x-auto shadow rounded-lg bg-white">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white text-base">
              <tr>
                <th className="px-6 py-4">Option</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Marque</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Structure</th>
                <th className="px-6 py-4">Km total</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((vehicule, index) => (
                <tr
                  key={vehicule.code_vehicule}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-indigo-50 transition-colors`}
                >
                  <td className="px-6 py-4 text-xl ">⋮</td>
                  <td className="px-6 py-4">{vehicule.code_vehicule}</td>
                  <td className="px-6 py-4">{vehicule.marque_designation}</td>
                  <td className="px-6 py-4">{vehicule.type_designation}</td>
                  <td className="px-6 py-4">
                    {vehicule.status_designation ?? (
                      <span className="italic text-gray-400">Non défini</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{vehicule.code_structure}</td>
                  <td className="px-6 py-4">
                    {vehicule.total_kilometrage.toLocaleString()} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
          >
            ← Précédent
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 rounded-md font-medium ${
                currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}
