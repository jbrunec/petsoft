import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
type PetFormBtnProps = {
  actionType: "add" | "edit";
};
export default function PetFormBtn({ actionType }: PetFormBtnProps) {
  return (
    <Button type="submit" className={cn("mt-5 self-end")}>
      {actionType === "add" ? "Add a new pet" : "Edit pet"}
    </Button>
  );
}
