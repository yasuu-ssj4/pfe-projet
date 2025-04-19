"use client";
import { VehicleForm } from "./formVehicules";
type StepFourProps = {
    FormValue: VehicleForm;
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    SetFormValue: React.Dispatch<React.SetStateAction<VehicleForm>>;
}

const StepFour: React.FC<StepFourProps> = ({ FormValue, SetStep, SetFormValue }) => {
    const handleDate = (e:React.ChangeEvent<HTMLInputElement>) =>{
       const {name,value} = e.target;
       SetFormValue({ ...FormValue, [name]: value });
    }
    return(
        <div className="bg-[#f2f2f2] p-6  rounded-2xl shadow-xl max-w-4xl mx-auto mt-10">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Document de bord</h2>
                    <div>
                    <div className="flex">

                     <div>
                    <label htmlFor="date_debut_assurance">Date debut assurance</label>
                   <input
                   id="date_debut_assurance"
                   name="date_debut_assurance"
                   type="date"
                   value={FormValue.date_debut_assurance ?? ""}
                   onChange={handleDate}
                   />
                   <br/>
                   <label htmlFor="date_fin_assurance">Date fin assurance</label>
                   <input
                   id="date_fin_assurance"
                   name="date_fin_assurance"
                   type="date"
                   value={FormValue.date_fin_assurance ?? ""}
                   onChange={handleDate}
                   />
                   </div>

                   <div>
                   <label htmlFor="date_debut_controle_technique">Date debut controle technique</label>
                   <input
                   id="date_debut_controle_technique"
                   name="date_debut_controle_technique"
                   type="date"
                   value={FormValue.date_debut_controle_technique ?? ""}
                   onChange={handleDate}
                   />
                   <label htmlFor="date_fin_controle_technique">Date fin controle technique</label>
                   <input
                   id="date_fin_controle_technique"
                   name="date_fin_controle_technique"
                   type="date"
                   value={FormValue.date_fin_controle_technique ?? ""}
                   onChange={handleDate}
                   />
                   </div>
                   <div>
                    <label htmlFor="date_debut_permis_circuler">Date debut du permis de circuler</label>
                    <input
                    id="date_debut_permis_circuler"
                    name="date_debut_permis_circuler" 
                    type="date"
                    value={FormValue.date_debut_permis_circuler ?? ""}
                    onChange={handleDate}
                    />
                    <label htmlFor="date_fin_permis_circuler">Date fin du permis de circuler</label>
                    <input
                    id="date_fin_permis_circuler"
                    name="date_fin_permis_circuler"
                    type="date"
                    value={FormValue.date_fin_permis_circuler ?? ""}
                    onChange={handleDate}
                    />
                   </div>
                   <div>
                    <label htmlFor="date_debut_atmd">Date debut autorisation de transport de matériel dangereuse</label>
                    <input
                    id="date_debut_atmd"
                    name="date_debut_atmd"
                    type="date" 
                    value={FormValue.date_debut_atmd ?? ""}
                    onChange={handleDate}
                    />
                    <label htmlFor="date_fin_atmd">Date fin ATMD</label>
                    <input
                    id="date_fin_atmd"
                    name="date_fin_atmd"
                    type="date"
                    value={FormValue.date_fin_atmd ?? ""}
                    onChange={handleDate}
                    />
                   </div>
                   {["F", "S"].includes(FormValue.code_genre) && (
                    <div>
                        <label htmlFor="date_debut_certificat">Date debut certificat réepreuve</label>
                        <input
                        id="date_debut_certificat"
                        name="date_debut_certificat"
                        type="date"
                        value={FormValue.date_debut_certificat ?? ""}
                        onChange={handleDate}
                        />
                        <label htmlFor="date_fin_certificat">Date fin certificat réepreuve</label>
                        <input
                        id="date_fin_certificat"
                        name="date_fin_certificat"
                        type="date"
                        value={FormValue.date_fin_certificat ?? ""}
                        onChange={handleDate}
                        />
                    </div>
                )}
                {["E", "R"].includes(FormValue.code_genre) && (
                    <div>
                        <label htmlFor="date_debut_certificat">Date debut certificat baremage</label>
                        <input
                        id="date_debut_certificat"
                        name="date_debut_certificat"
                        type="date"
                        value={FormValue.date_debut_certificat ?? ""}
                        onChange={handleDate}
                        />
                        <label>Date fin certificat baremage</label>
                        <input
                        id="date_fin_certificat"
                        name="date_fin_certificat"
                        type="date"
                        value={FormValue.date_fin_certificat ?? ""}
                        onChange={handleDate}
                        />
                    </div>
                )}

</div>
            <div className="flex justify-end mt-10 space-x-4">
            <button
            type="button"
            onClick = {() => SetStep(3)} 
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300">
            Retourner</button>
            <button
            type="submit" 
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300"
            >Confirmer</button>
         </div>
         </div>
         </div>
         
    );
}
export default StepFour;
