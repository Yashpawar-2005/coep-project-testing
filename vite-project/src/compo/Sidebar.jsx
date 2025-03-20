"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { api } from "@/services/axios"
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Database, 
  Send, 
  LogOut, 
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { useSendtoAdmin, useUserStore } from "@/services/atom"
import SendToAdminButton from "./Sendtoadmin"

export function Sidebar({ isCollapsed: externalIsCollapsed, setIsCollapsed: externalSetIsCollapsed,admindata }) {
  const [teams, setTeams] = useState([]); // Ensure teams is an array
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(externalIsCollapsed || false);
  const { user } = useUserStore();
  const {dataforadmin}=useSendtoAdmin();
  const {id}=useParams();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get("/team/get_team", { withCredentials: true });
        const { created_room, joined_room } = response.data;
        setTeams([...joined_room, ...created_room]||[]);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (typeof externalIsCollapsed !== 'undefined') {
      setInternalIsCollapsed(externalIsCollapsed);
    }
  }, [externalIsCollapsed]);

  const toggleCollapse = () => {
    const newState = !internalIsCollapsed;
    setInternalIsCollapsed(newState);
    if (typeof externalSetIsCollapsed === 'function') {
      externalSetIsCollapsed(newState);
    }
  };
const handlesendtoadmin=async () => {
  try {
    console.log(admindata)
    const response=await api.post(`/submit_to_admin/${id}`,{"progress":[admindata]})
    console.log(response)
  } catch (error) {
    console.log(error)
  }
}
  const isCollapsed = internalIsCollapsed;

  return (
    <div
      className={cn(
        "bg-black text-gray-200 transition-all duration-300 border-r border-gray-800 flex-shrink-0 h-screen mt-1",
        isCollapsed ? "w-16" : "w-64 md:w-72",
      )}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white truncate">Workspace</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 rounded-full bg-gray-900 hover:bg-indigo-800 text-white"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        <Separator className="bg-gray-800" />

        {/* User Profile */}
        <div className={cn("p-4", isCollapsed ? "flex justify-center" : "")}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("flex items-center", !isCollapsed && "gap-3")}>
                <Avatar className="h-10 w-10 border-2 border-indigo-500">
  <AvatarImage
    src={
      user.data.avatar ||
      `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(user.data.name)}`
    }
    alt={user.data.name}
  />
  <AvatarFallback className="bg-indigo-600 text-white">
    {user.data.name?.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>


                  {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-white truncate">{user.data.name}</span>
                      <span className="text-xs text-gray-400 truncate">{user.data.email}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
                  {user.data.name}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator className="bg-gray-800" />

        {/* Navigation Sections */}
        <div className="space-y-6 flex-1 px-2 overflow-hidden py-4">
          {/* Teams Section */}
          <div>
            {!isCollapsed && (
              <h2 className="text-sm text-indigo-400 mb-2 px-2 font-medium uppercase tracking-wider">
                Teams
              </h2>
            )}
            <ScrollArea className="h-[calc(40vh)]">
              <div className="space-y-1 pr-2">
                {teams.map((team) => (
                  <TooltipProvider key={team.id} delayDuration={300}>
                    <Tooltip>
                      <Link to={`/room/${team.id}`}>
                      <TooltipTrigger asChild>

                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start px-2 py-2 h-auto rounded-lg hover:bg-gray-900 transition-colors text-gray-300 hover:text-white",
                            isCollapsed && "justify-center"
                          )}
                          >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-900 text-indigo-400">
                            <Users size={16} />
                          </div>
                          {!isCollapsed && (
                            <div className="ml-3 flex items-center justify-between flex-1 overflow-hidden">
                              <span className="text-sm font-medium truncate">{team.name}</span>
                              <span className="text-xs text-indigo-300 bg-gray-900 px-2 py-1 rounded-full">
                                {team._count.members+1 || 0}
                              </span>
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                   </Link>
                      {isCollapsed && (

<Link to={`/room/${team.id}`}>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
                          {team.name}
                        </TooltipContent>
</Link>

                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Tools Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h2 className="text-sm text-indigo-400 mb-2 px-2 font-medium uppercase tracking-wider">
                Tools
              </h2>
            )}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-2 py-2 h-auto rounded-lg hover:bg-gray-900 transition-colors text-gray-300 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-900 text-emerald-400">
                      <Database size={16} />
                    </div>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium truncate">Schema Viewer</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">Schema Viewer</TooltipContent>}
              </Tooltip>
            </TooltipProvider>

            <SendToAdminButton admindata={admindata}/>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-2 py-2 h-auto rounded-lg hover:bg-gray-900 transition-colors text-gray-300 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-900 text-amber-400">
                      <Settings size={16} />
                    </div>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium truncate">Settings</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">Settings</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800 mt-auto">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start hover:bg-red-900/20 text-red-400 hover:text-red-300", isCollapsed && "justify-center")}
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span>Logout</span>}
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
