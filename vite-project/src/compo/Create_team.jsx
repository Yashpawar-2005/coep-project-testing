import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
// import { toast } from "@/hooks/use-toast"

export function CreateTeamForm({ onCreateTeam }) {
  const [teamName, setTeamName] = useState("")
  const [password, setPassword] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!teamName.trim()) {
      alert({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }
    
    if (!password.trim()) {
      alert({
        title: "Error",
        description: "Password is required",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {

      await onCreateTeam({
        teamName,
        password,
        description,
      })
      setTeamName("")
      setPassword("")
      setDescription("")

      alert({
        title: "Team created",
        description: `${teamName} has been created successfully`,
      })
    } catch (error) {
      alert({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="team-name">Team Name</Label>
        <Input
          id="team-name"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-password">Password</Label>
        <Input
          id="team-password"
          type="password"
          placeholder="Create a team password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-description">Description</Label>
        <Textarea
          id="team-description"
          placeholder="Describe your team's purpose"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Team"}
      </Button>
    </form>
  )
}

