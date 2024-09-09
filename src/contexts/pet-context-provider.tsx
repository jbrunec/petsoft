"use client";
import { addPet } from "@/actions/actions";
import { Pet } from "@/lib/types";
import React, { createContext, ReactNode, useState } from "react";

type PetContextProviderProps = {
  data: Pet[];
  children: ReactNode;
};
type TPetContext = {
  pets: Pet[];
  selectedPetId: string | null;
  selectedPet: Pet | undefined;
  numberOfPets: number;
  handleChangeSelectedPetId: (id: string) => void;
  handleCheckoutPet: (id: string) => void;
  handleAddPet: (newPet: Omit<Pet, "id">) => void;
  handleEditPet: (petId: string, updatedPet: Omit<Pet, "id">) => void;
};
export const PetContext = createContext<TPetContext | null>(null);
export default function PetContextProvider({
  data: pets,
  children,
}: PetContextProviderProps) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const selectedPet = pets.find((pet) => pet.id == selectedPetId);
  const numberOfPets = pets.length;

  const handleChangeSelectedPetId = (id: string) => {
    setSelectedPetId(id);
  };

  const handleCheckoutPet = (id: string) => {
    // setPets((prev) => prev.filter((pet) => pet.id !== id));
    // setSelectedPetId(null);
  };

  const handleAddPet = async (newPet: Omit<Pet, "id">) => {
    // setPets((prev) => [
    //   ...prev,
    //   {
    //     id: Date.now().toString(),
    //     ...newPet,
    //   },
    // ]);
    // await addPet(newPet);
  };

  const handleEditPet = (petId: string, updatedPet: Omit<Pet, "id">) => {
    // setPets((prev) =>
    //   prev.map((pet) => {
    //     if (pet.id === petId) {
    //       return {
    //         id: petId,
    //         ...updatedPet,
    //       };
    //     }
    //     return pet;
    //   })
    // );
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        handleChangeSelectedPetId,
        handleCheckoutPet,
        handleAddPet,
        handleEditPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
