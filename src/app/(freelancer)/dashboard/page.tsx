
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, IndianRupee, Users, Briefcase, MessageSquare } from "lucide-react"

const revenueData = [
  { month: 'Jan', revenue: 400000 },
  { month: 'Feb', revenue: 300000 },
  { month: 'Mar', revenue: 500000 },
  { month: 'Apr', revenue: 450000 },
  { month: 'May', revenue: 600000 },
  { month: 'Jun', revenue: 550000 },
];

const profileViewsData = [
  { month: 'Jan', views: 1200 },
  { month: 'Feb', views: 1800 },
  { month: 'Mar', views: 2200 },
  { month: 'Apr', views: 2500 },
  { month: 'May', views: 3100 },
  { month: 'Jun', views: 4200 },
];

const recentActivities = [
    { type: 'message', from: 'Client Inc.', content: 'Can you start on Monday?', time: '5m ago' },
    { type: 'gig', from: 'Innovate LLC', content: 'New gig: "React Native App"', time: '1h ago' },
    { type: 'payment', from: 'Startup Co.', content: 'Payment received for "Logo Design"', time: '3h ago' },
    { type: 'review', from: 'MegaCorp', content: 'You received a 5-star review!', time: '1d ago' },
]


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Here's a real-time overview of your freelance activity.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <IndianRupee className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹4,523,189</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Gigs
                    </CardTitle>
                     <Briefcase className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+5</div>
                    <p className="text-xs text-muted-foreground">
                        +2 since last week
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                     <Users className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">
                        +180.1% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                     <MessageSquare className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+12</div>
                    <p className="text-xs text-muted-foreground">
                        3 unread
                    </p>
                </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card>
                <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>Your monthly earnings for the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))'
                                }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: 'hsl(var(--primary))'}} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Views</CardTitle>
                    <CardDescription>How many times your profile has been viewed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={profileViewsData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{fill: 'hsl(var(--muted))'}}
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))'
                                }}
                            />
                            <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates on your gigs and messages.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentActivities.map((activity, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Badge variant={activity.type === 'payment' ? 'default' : 'secondary'}>{activity.type}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{activity.from}</TableCell>
                                <TableCell>{activity.content}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">View All Activity</Button>
            </CardFooter>
        </Card>
    </div>
  )
}
