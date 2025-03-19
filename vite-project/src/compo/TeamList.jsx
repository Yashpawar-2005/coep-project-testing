import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Users, Settings, ArrowRight } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { data, Link } from "react-router-dom"

export function TeamList({ teams, emptyMessage, dateLabel, showManage }) {
  if (!teams.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} dateLabel={dateLabel} showManage={showManage} />
      ))}
    </div>
  )
}

function TeamCard({ team, dateLabel, showManage }) {
  const date = (team.joinedAt || team.createdAt)?.split('T')[0];
  console.log(team)
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <span>{team.name}</span>
          <Badge variant="outline" className="ml-2">
            <Users className="h-3 w-3 mr-1" />
            {team._count.members+1}
          </Badge>
        </CardTitle>
        <CardDescription>
          {dateLabel}: {date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{team.discription || "No description provided for this team."}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 pb-2">
        {showManage ? (
          <Link to={`/teams/manage/${team.id}`} passHref>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </Link>
        ) : (
          <div></div>
        )}
        <Link to={`/room/${team.id}`}>
        <Button size="sm">
          View Team
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

