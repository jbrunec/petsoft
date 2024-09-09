"use client";
import { addPet, deletePet, editPet } from "@/actions/actions";
import { PetEssentials } from "@/lib/types";
import { Pet } from "@prisma/client";
import React, {
  createContext,
  ReactNode,
  useOptimistic,
  useState,
} from "react";
import { toast } from "sonner";

type PetContextProviderProps = {
  data: Pet[];
  children: ReactNode;
};
type TPetContext = {
  pets: Pet[];
  selectedPetId: Pet["id"] | null;
  selectedPet: Pet | undefined;
  numberOfPets: number;
  handleChangeSelectedPetId: (id: Pet["id"]) => void;
  handleCheckoutPet: (id: Pet["id"]) => Promise<void>;
  handleAddPet: (newPet: PetEssentials) => Promise<void>;
  handleEditPet: (petId: Pet["id"], updatedPet: PetEssentials) => Promise<void>;
};
export const PetContext = createContext<TPetContext | null>(null);
export default function PetContextProvider({
  data,
  children,
}: PetContextProviderProps) {
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          return [...state, { ...payload, id: Math.random().toString() }];
        case "edit":
          return state.map((pet) => {
            if (pet.id === payload.id) {
              return { ...pet, ...payload.updatedPet };
            }
            return pet;
          });
        case "delete":
          return state.filter((pet) => pet.id !== payload);
        default:
          return state;
      }
    }
  );
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const selectedPet = optimisticPets.find((pet) => pet.id == selectedPetId);
  const numberOfPets = optimisticPets.length;

  const handleChangeSelectedPetId = (id: Pet["id"]) => {
    setSelectedPetId(id);
  };

  const handleCheckoutPet = async (id: Pet["id"]) => {
    setOptimisticPets({ action: "delete", payload: id });
    const error = await deletePet(id);
    if (error) {
      toast.warning(error.message);
    }
    setSelectedPetId(null);
  };

  const handleAddPet = async (newPet: PetEssentials) => {
    setOptimisticPets({ action: "add", payload: newPet });
    const error = await addPet(newPet);
    if (error) {
      toast.warning(error.message);
    }
  };

  const handleEditPet = async (petId: Pet["id"], updatedPet: PetEssentials) => {
    setOptimisticPets({ action: "edit", payload: { id: petId, updatedPet } });
    const error = await editPet(petId, updatedPet);
    if (error) {
      toast.warning(error.message);
    }
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
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
