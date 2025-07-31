
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const tasks = [
    { id: 1, title: 'Design a new logo for a startup', status: 'In Progress', deadline: '2024-08-15' },
    { id: 2, title: 'Develop a React component library', status: 'Completed', deadline: '2024-07-30' },
    { id: 3, title: 'Write documentation for the API', status: 'Pending', deadline: '2024-08-20' },
    { id: 4, title: 'Fix bugs in the payment gateway', status: 'In Progress', deadline: '2024-08-10' },
]

export default function TasksPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Active Gigs</h1>
        <p className="text-muted-foreground">Here is a list of your current and past gigs.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gigs List</CardTitle>
          <CardDescription>An overview of all your assigned gigs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.deadline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
