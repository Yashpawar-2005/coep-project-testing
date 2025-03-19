import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
// import { toast } from "@/hooks/use-toast"

export function JoinTeamForm({ onJoinTeam }) {
  const [teamName, setTeamName] = useState("")
  const [password, setPassword] = useState("")
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
      // In a real app, this would be an API call
      await onJoinTeam({
        teamName,
        password,
      })

      // Reset form
      setTeamName("")
      setPassword("")

      alert({
        title: "Team joined",
        description: "You have successfully joined the team",
      })
    } catch (error) {
      alert({
        title: "Error",
        description: error.message || "Failed to join team",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="join-team-name">Team Name</Label>
        <Input
          id="join-team-name"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="join-team-password">Password</Label>
        <Input
          id="join-team-password"
          type="password"
          placeholder="Enter team password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">Team passwords are provided by team administrators</p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Joining..." : "Join Team"}
      </Button>
    </form>
  )
}

