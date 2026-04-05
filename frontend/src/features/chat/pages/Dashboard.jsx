import ChatBox from "../components/ChatBox";
import Sidebar from "../components/SideBar";
import UserMenu from "../components/UserMenu";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Dashboard() {
  return (
    <div className="flex h-screen w-[100svw] bg-black text-white">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3">
          
          {/* Mobile Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-64 p-0 bg-black border-r"
            >
              <Sidebar />
            </SheetContent>

          </Sheet>

          {/* <UserMenu /> */}
        </div>

        {/* Chat */}
        <div className="flex-1">
          <ChatBox />
        </div>

      </div>

    </div>
  );
}