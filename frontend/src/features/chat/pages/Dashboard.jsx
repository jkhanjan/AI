import ChatBox from "../components/ChatBox";
import Sidebar from "../components/SideBar";
import { Bot, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useChat } from "../context/ChatContext";

export default function Dashboard() {
  const { activeId } = useChat(); 

  return (
    <div className="flex h-screen w-[100svw] bg-black text-white">

      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative flex-shrink-0">
        <Sidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!activeId && (
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>AI Assistant</span>
            </div>
          </div>
        )}

        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-black border-r">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat */}
        {activeId ? ( 
          <div className="flex-1 min-w-0">
            <ChatBox key={activeId} />
          </div>
          ) : (
          <div className="w-full h-full flex items-center justify-center">
            Select/create a chat to start messaging
          </div>
          )
          }

      </div>
    </div>
  );
}