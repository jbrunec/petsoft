"use client";
import { usePetContext, useSearchContext } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function PetList() {
  const { pets, selectedPetId, handleChangeSelectedPetId } = usePetContext();
  const { searchQuery } = useSearchContext();
  const filteredPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(searchQuery)
  );
  return (
    <ul className="bg-white border-b border-black/[0.08]">
      {filteredPets.map((pet) => (
        <li key={pet.id}>
          <button
            onClick={() => handleChangeSelectedPetId(pet.id)}
            className={cn(
              "flex items-center h-[70px] w-full cursor-pointer px-5 text-base gap-3 hover:bg-[#eff1f2] focus:bg-[#eff1f2] transition",
              { "bg-[#eff1f2]": selectedPetId === pet.id }
            )}
          >
            <Image
              src={pet.imageUrl}
              alt="pet image"
              width={45}
              height={45}
              className="w-[45px] h-[45px] rounded-full object-cover"
            />
            <p className="font-semibold">{pet.name}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
