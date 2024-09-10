import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
type AuthFormProps = {
  type: "login" | "signup";
};
export default function AuthForm({ type }: AuthFormProps) {
  return (
    <form>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <div className="space-y-1 mb-4 mt-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
      </div>
      <Button>{type === "login" ? "Log In" : "Sing Up"}</Button>
    </form>
  );
}
