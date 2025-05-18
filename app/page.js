import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";

export default function Home() {
  return (
    <div className="text-2xl">
      <h2>Welcome Sir</h2>

      <Button>Subscribe</Button>
      <UserButton/>
    </div> 
  );
}
