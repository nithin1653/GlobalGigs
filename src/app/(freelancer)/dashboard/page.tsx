
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

const revenueData: any[] = [];
const profileViewsData: any[] = [];
const recentActivities: any[] = [];


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Here's a real-time overview of your freelance activity.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <IndianRupee className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹0</div>
                    <p className="text-xs text-muted-foreground">
                        No revenue data yet
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
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                        No active gigs
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                     <Users className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                        No profile views yet
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                     <MessageSquare className="text-muted-foreground h-4 w-4"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                        No new messages
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
                    {revenueData.length > 0 ? (
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
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            <p>No revenue data available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Views</CardTitle>
                    <CardDescription>How many times your profile has been viewed.</CardDescription>
                </CardHeader>
                <CardContent>
                     {profileViewsData.length > 0 ? (
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
                     ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            <p>No profile view data available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates on your gigs and messages.</CardDescription>
            </CardHeader>
            <CardContent>
                 {recentActivities.length > 0 ? (
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
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No recent activity.</p>
                    </div>
                )}
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">View All Activity</Button>
            </CardFooter>
        </Card>
    </div>
  )
}
