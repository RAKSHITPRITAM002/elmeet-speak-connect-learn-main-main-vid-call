import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  PieChart, 
  Users, 
  Clock, 
  Calendar, 
  Settings, 
  CreditCard, 
  Shield, 
  Server, 
  Database, 
  Mail,
  Globe,
  FileText,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Search
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock data for the dashboard
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", lastLogin: "2023-06-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Teacher", status: "Active", lastLogin: "2023-06-14" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Student", status: "Inactive", lastLogin: "2023-05-20" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Teacher", status: "Active", lastLogin: "2023-06-10" },
  { id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "Student", status: "Active", lastLogin: "2023-06-12" },
];

const mockMeetings = [
  { id: "meet-1", title: "English Conversation Class", host: "Jane Smith", participants: 12, duration: 65, date: "2023-06-15" },
  { id: "meet-2", title: "Spanish Beginner Lesson", host: "Alice Brown", participants: 8, duration: 45, date: "2023-06-14" },
  { id: "meet-3", title: "Japanese Kanji Practice", host: "John Doe", participants: 5, duration: 30, date: "2023-06-13" },
  { id: "meet-4", title: "French Pronunciation Workshop", host: "Jane Smith", participants: 15, duration: 90, date: "2023-06-12" },
  { id: "meet-5", title: "German Grammar Review", host: "Alice Brown", participants: 7, duration: 60, date: "2023-06-11" },
];

const mockSubscriptions = [
  { id: "sub-1", plan: "Pro", user: "Jane Smith", status: "Active", startDate: "2023-01-15", endDate: "2023-07-15", amount: 15.00 },
  { id: "sub-2", plan: "Enterprise", user: "Alice Brown", status: "Active", startDate: "2023-02-10", endDate: "2024-02-10", amount: 99.00 },
  { id: "sub-3", plan: "Pro", user: "Charlie Wilson", status: "Canceled", startDate: "2023-03-05", endDate: "2023-06-05", amount: 15.00 },
  { id: "sub-4", plan: "Pro", user: "Bob Johnson", status: "Expired", startDate: "2023-01-20", endDate: "2023-04-20", amount: 15.00 },
];

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState(mockUsers);
  const [meetings, setMeetings] = useState(mockMeetings);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemSettings, setSystemSettings] = useState({
    enableRegistration: true,
    maxMeetingParticipants: 50,
    maxMeetingDuration: 240,
    enableRecording: true,
    storageLimit: 5,
    emailNotifications: true,
    maintenanceMode: false,
    debugMode: false,
    apiRateLimit: 100,
    defaultLanguage: "English"
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    // In a real app, you would check if the user has admin privileges
  }, [isAuthenticated, navigate]);

  // Usage statistics
  const usageStats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: { status: string; }) => u.status === "Active").length,
    totalMeetings: meetings.length,
    totalMeetingMinutes: meetings.reduce((acc: any, meeting: { duration: any; }) => acc + meeting.duration, 0),
    averageMeetingDuration: Math.round(meetings.reduce((acc: any, meeting: { duration: any; }) => acc + meeting.duration, 0) / meetings.length),
    activeSubscriptions: subscriptions.filter((s: { status: string; }) => s.status === "Active").length,
    totalRevenue: subscriptions.reduce((acc: any, sub: { amount: any; }) => acc + sub.amount, 0).toFixed(2)
  };

  // Handle system setting change
  const handleSettingChange = (setting: string, value: any) => {
    setSystemSettings((prev: any) => ({
      ...prev,
      [setting]: value
    }));
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user: { name: string; email: string; role: string; }) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{usageStats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {usageStats.activeUsers} active users
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{usageStats.totalMeetings}</div>
                    <p className="text-xs text-muted-foreground">
                      {usageStats.totalMeetingMinutes} total minutes
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{usageStats.activeSubscriptions}</div>
                    <p className="text-xs text-muted-foreground">
                      ${usageStats.totalRevenue} total revenue
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Meeting Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{usageStats.averageMeetingDuration} min</div>
                    <p className="text-xs text-muted-foreground">
                      Per meeting average
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Meetings</CardTitle>
                    <CardDescription>
                      Last 5 meetings across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Host</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meetings.slice(0, 5).map((meeting: { id: any; title: any; host: any; participants: any; date: any; }) => (
                          <TableRow key={meeting.id}>
                            <TableCell className="font-medium">{meeting.title}</TableCell>
                            <TableCell>{meeting.host}</TableCell>
                            <TableCell>{meeting.participants}</TableCell>
                            <TableCell>{meeting.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("meetings")}>
                      View All Meetings
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>
                      Last 5 users who joined the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.slice(0, 5).map((user: { id: any; name: any; email: any; role: any; status: string; }) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("users")}>
                      View All Users
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage all users on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e: { target: { value: any; }; }) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: { id: any; name: any; email: any; role: any; status: string; lastLogin: any; }) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>{user.lastLogin}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Meetings Tab */}
            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Management</CardTitle>
                  <CardDescription>
                    View and manage all meetings on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Duration (min)</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings.map((meeting: { id: any; title: any; host: any; participants: any; duration: any; date: any; }) => (
                        <TableRow key={meeting.id}>
                          <TableCell className="font-medium">{meeting.title}</TableCell>
                          <TableCell>{meeting.host}</TableCell>
                          <TableCell>{meeting.participants}</TableCell>
                          <TableCell>{meeting.duration}</TableCell>
                          <TableCell>{meeting.date}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    View and manage all subscriptions on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((subscription: { id: any; user: any; plan: any; status: string; startDate: any; endDate: any; amount: number; }) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">{subscription.user}</TableCell>
                          <TableCell>{subscription.plan}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              subscription.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              subscription.status === 'Canceled' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {subscription.status}
                            </span>
                          </TableCell>
                          <TableCell>{subscription.startDate}</TableCell>
                          <TableCell>{subscription.endDate}</TableCell>
                          <TableCell>${subscription.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure global settings for the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Registration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-registration" className="font-medium">Enable User Registration</Label>
                        <Switch 
                          id="enable-registration" 
                          checked={systemSettings.enableRegistration}
                          onCheckedChange={(checked: any) => handleSettingChange('enableRegistration', checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
                    </div>
                    
                    {/* Meeting Participants */}
                    <div className="space-y-2">
                      <Label htmlFor="max-participants" className="font-medium">Maximum Meeting Participants</Label>
                      <Input 
                        id="max-participants" 
                        type="number" 
                        value={systemSettings.maxMeetingParticipants}
                        onChange={(e: { target: { value: string; }; }) => handleSettingChange('maxMeetingParticipants', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">Maximum number of participants allowed in a meeting</p>
                    </div>
                    
                    {/* Meeting Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="max-duration" className="font-medium">Maximum Meeting Duration (minutes)</Label>
                      <Input 
                        id="max-duration" 
                        type="number" 
                        value={systemSettings.maxMeetingDuration}
                        onChange={(e: { target: { value: string; }; }) => handleSettingChange('maxMeetingDuration', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">Maximum duration for a single meeting session</p>
                    </div>
                    
                    {/* Recording */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-recording" className="font-medium">Enable Meeting Recording</Label>
                        <Switch 
                          id="enable-recording" 
                          checked={systemSettings.enableRecording}
                          onCheckedChange={(checked: any) => handleSettingChange('enableRecording', checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">Allow users to record meeting sessions</p>
                    </div>
                    
                    {/* Storage Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="storage-limit" className="font-medium">Storage Limit (GB)</Label>
                      <Input 
                        id="storage-limit" 
                        type="number" 
                        value={systemSettings.storageLimit}
                        onChange={(e: { target: { value: string; }; }) => handleSettingChange('storageLimit', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">Maximum storage space per user for recordings and uploads</p>
                    </div>
                    
                    {/* Email Notifications */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                        <Switch 
                          id="email-notifications" 
                          checked={systemSettings.emailNotifications}
                          onCheckedChange={(checked: any) => handleSettingChange('emailNotifications', checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">Send email notifications for meetings and system updates</p>
                    </div>
                    
                    {/* Maintenance Mode */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maintenance-mode" className="font-medium">Maintenance Mode</Label>
                        <Switch 
                          id="maintenance-mode" 
                          checked={systemSettings.maintenanceMode}
                          onCheckedChange={(checked: any) => handleSettingChange('maintenanceMode', checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">Put the platform in maintenance mode (only admins can access)</p>
                    </div>
                    
                    {/* Debug Mode */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debug-mode" className="font-medium">Debug Mode</Label>
                        <Switch 
                          id="debug-mode" 
                          checked={systemSettings.debugMode}
                          onCheckedChange={(checked: any) => handleSettingChange('debugMode', checked)}
                        />
                      </div>
                      <p className="text-sm text-gray-500">Enable detailed logging and debugging information</p>
                    </div>
                    
                    {/* API Rate Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="api-rate-limit" className="font-medium">API Rate Limit (requests/minute)</Label>
                      <Input 
                        id="api-rate-limit" 
                        type="number" 
                        value={systemSettings.apiRateLimit}
                        onChange={(e: { target: { value: string; }; }) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">Maximum API requests allowed per minute per user</p>
                    </div>
                    
                    {/* Default Language */}
                    <div className="space-y-2">
                      <Label htmlFor="default-language" className="font-medium">Default Language</Label>
                      <select 
                        id="default-language" 
                        className="w-full p-2 border rounded-md"
                        value={systemSettings.defaultLanguage}
                        onChange={(e: { target: { value: any; }; }) => handleSettingChange('defaultLanguage', e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Korean">Korean</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Russian">Russian</option>
                      </select>
                      <p className="text-sm text-gray-500">Default language for the platform interface</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
