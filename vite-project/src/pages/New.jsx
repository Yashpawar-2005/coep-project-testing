import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { CreateTeamForm } from "../compo/Create_team"
// import { JoinTeamForm } from "@/compo/Join_team"
import { JoinTeamForm } from "../compo/Join_team"
import { api } from "@/services/axios"
import { TeamList } from "../compo/TeamList"
import { useUserStore } from "@/services/atom"
import { Navigate } from "react-router-dom"
import { useNavigate } from "react-router-dom"
// Mock data for demonstration
// const mockJoinedTeams = [
//   { id: "1", name: "Design Team", memberCount: 8, joinedAt: "2023-05-15" },
//   { id: "2", name: "Marketing", memberCount: 12, joinedAt: "2023-07-22" },
//   { id: "3", name: "Development", memberCount: 16, joinedAt: "2023-09-10" },
// ]

// const mockCreatedTeams = [
//   {
//     id: "4",
//     name: "Project Alpha",
//     memberCount: 5,
//     createdAt: "2023-08-03",
//     description: "A team for the Alpha project development",
//   },
//   {
//     id: "5",
//     name: "Research Group",
//     memberCount: 7,
//     createdAt: "2023-10-18",
//     description: "Research and development of new features",
//   },
// ]

export default function TeamManagement() {
  const [joinedTeams, setJoinedTeams] = useState([])
  const [createdTeams, setCreatedTeams] = useState([])
  const {logout}=useUserStore()
  const router=useNavigate()
  useEffect(() => {
    const getdata= async() => {
      const response=await api.get("/team/get_team",{withCredentials:true})
      const { created_room, joined_room } = response.data;
      setJoinedTeams(joined_room|| []);
        setCreatedTeams(created_room || []);
      console.log(response)
    }
    getdata();
  }, [])
  
  const handleCreateTeam = async (newTeam) => {
    const response=await api.post("/team/create-team",{newTeam},{withCredentials:true})
    console.log("hiiiiiii")
    console.log(response)
    router(`/room/${response.data.data.id}`);
    // In a real app, you would call your API endpoint here
    // const response = await fetch('/api/teams/create', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newTeam)
    // });
    // const data = await response.json();

    // For demo purposes, we'll just add it to the state
    // setCreatedTeams([
    //   ...createdTeams,
    //   {
    //     ...newTeam,
    //     id: (createdTeams.length + 6).toString(),
    //     memberCount: 1,
    //     createdAt: new Date().toISOString().split("T")[0],
    //   },
    // ])
  }

  const handleJoinTeam = async (teamData) => {
    const response=await api.post("/team/join-team",{teamData},{withCredentials:true})
    console.log("oooooooo")
    console.log(response)
    router(`/room/${response.data.data.id}`);
    // In a real app, you would call your API endpoint here
    // const response = await fetch('/api/teams/join', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(teamData)
    // });
    // const data = await response.json();

    // For demo purposes, we'll just add it to the state
    // const mockNewTeam = {
    //   id: (joinedTeams.length + 10).toString(),
    //   name: teamData.teamName,
    //   memberCount: Math.floor(Math.random() * 20) + 2,
    //   joinedAt: new Date().toISOString().split("T")[0],
    // }
    // setJoinedTeams([...joinedTeams, mockNewTeam])
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Team Management</h1>
      <button onClick={()=>{logout()}}> click here</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Team</CardTitle>
            <CardDescription>Start collaborating by creating your own team</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTeamForm onCreateTeam={handleCreateTeam} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join an Existing Team</CardTitle>
            <CardDescription>Enter team name and password to join</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinTeamForm onJoinTeam={handleJoinTeam} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="joined" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="joined">Teams You've Joined</TabsTrigger>
          <TabsTrigger value="created">Teams You've Created</TabsTrigger>
        </TabsList>

        <TabsContent value="joined">
          <TeamList
            teams={joinedTeams}
            emptyMessage="You haven't joined any teams yet."
            dateLabel="Joined on"
            showManage={false}
          />
        </TabsContent>

        <TabsContent value="created">
          <TeamList
            teams={createdTeams}
            emptyMessage="You haven't created any teams yet."
            dateLabel="Created on"
            showManage={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
