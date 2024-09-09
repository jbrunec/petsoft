import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
type PetFormBtnProps = {
  actionType: "add" | "edit";
};
export default function PetFormBtn({ actionType }: PetFormBtnProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={cn("mt-5 self-end")}>
      {actionType === "add" ? "Add a new pet" : "Edit pet"}
    </Button>
  );
}
