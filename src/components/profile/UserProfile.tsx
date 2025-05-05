import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  CreditCard, 
  Clock, 
  Calendar, 
  FileText, 
  BarChart, 
  Upload, 
  Edit, 
  Save, 
  X, 
  Check, 
  Download, 
  ExternalLink, 
  Shield, 
  Bell, 
  Languages
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Types
interface UserProfileProps {
  userId?: string;
}

interface MeetingHistory {
  id: string;
  title: string;
  date: Date;
  duration: number; // in minutes
  participants: number;
  recordingAvailable: boolean;
}

interface Subscription {
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "canceled" | "expired";
  startDate: Date;
  endDate?: Date;
  price?: number;
  features: string[];
  paymentMethod?: {
    type: "credit_card" | "paypal";
    last4?: string;
    expiry?: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "meetings" | "subscription" | "settings">("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    title: "Language Teacher",
    organization: "Language Academy",
    bio: "Experienced language teacher specializing in conversational skills.",
    language: "English",
    timezone: "UTC-5 (Eastern Time)",
    profilePicture: user?.picture || ""
  });
  
  // Sample meeting history
  const meetingHistory: MeetingHistory[] = [
    {
      id: "meet-1",
      title: "English Conversation Practice",
      date: new Date(Date.now() - 86400000), // yesterday
      duration: 60,
      participants: 5,
      recordingAvailable: true
    },
    {
      id: "meet-2",
      title: "Spanish Grammar Review",
      date: new Date(Date.now() - 86400000 * 3), // 3 days ago
      duration: 45,
      participants: 3,
      recordingAvailable: true
    },
    {
      id: "meet-3",
      title: "French Pronunciation Workshop",
      date: new Date(Date.now() - 86400000 * 7), // 7 days ago
      duration: 90,
      participants: 8,
      recordingAvailable: false
    },
    {
      id: "meet-4",
      title: "Japanese Kanji Study Group",
      date: new Date(Date.now() - 86400000 * 14), // 14 days ago
      duration: 120,
      participants: 4,
      recordingAvailable: true
    }
  ];
  
  // Sample subscription
  const subscription: Subscription = {
    plan: "pro",
    status: "active",
    startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
    endDate: new Date(Date.now() + 86400000 * 335), // 335 days from now
    price: 19.99,
    features: [
      "Unlimited meetings",
      "Up to 100 participants",
      "Meeting duration up to 24 hours",
      "Cloud recording (50GB)",
      "Language teaching tools",
      "Polls and quizzes",
      "Role play scenarios",
      "Virtual backgrounds",
      "Priority support"
    ],
    paymentMethod: {
      type: "credit_card",
      last4: "4242",
      expiry: "04/25"
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };
  
  // Handle profile form change
  const handleProfileChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save profile changes
  const saveProfileChanges = () => {
    // In a real app, you would save the changes to your backend
    console.log("Saving profile changes:", profileForm);
    setIsEditingProfile(false);
  };
  
  // Cancel profile editing
  const cancelProfileEditing = () => {
    // Reset form to original values
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      title: "Language Teacher",
      organization: "Language Academy",
      bio: "Experienced language teacher specializing in conversational skills.",
      language: "English",
      timezone: "UTC-5 (Eastern Time)",
      profilePicture: user?.picture || ""
    });
    setIsEditingProfile(false);
  };
  
  // Get subscription status badge
  const getSubscriptionStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };
  
  // Get plan badge
  const getPlanBadge = (plan: Subscription['plan']) => {
    switch (plan) {
      case 'free':
        return <Badge variant="outline">Free</Badge>;
      case 'basic':
        return <Badge variant="secondary">Basic</Badge>;
      case 'pro':
        return <Badge className="bg-blue-500">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500">Enterprise</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="user-profile container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profileForm.profilePicture} alt={profileForm.name} />
                  <AvatarFallback>{profileForm.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{profileForm.name}</h2>
                <p className="text-gray-500">{profileForm.title}</p>
                <p className="text-sm text-gray-500 mt-1">{profileForm.organization}</p>
                
                <div className="mt-4 w-full">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User size={16} className="mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-none h-12 ${activeTab === "profile" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-none h-12 ${activeTab === "meetings" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("meetings")}
                >
                  <Calendar size={16} className="mr-2" />
                  Meeting History
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-none h-12 ${activeTab === "subscription" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("subscription")}
                >
                  <CreditCard size={16} className="mr-2" />
                  Subscription
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-none h-12 ${activeTab === "settings" ? "bg-gray-100" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center mb-2">
                  <Badge variant="outline" className="mr-2">
                    {subscription.plan.toUpperCase()}
                  </Badge>
                  {getSubscriptionStatusBadge(subscription.status)}
                </div>
                <div className="flex items-center text-xs">
                  <Clock size={12} className="mr-1" />
                  Expires: {subscription.endDate ? formatDate(subscription.endDate) : 'Never'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <TabsContent value="profile" className="mt-0" hidden={activeTab !== "profile"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={cancelProfileEditing}>
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={saveProfileChanges}>
                      <Save size={16} className="mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                          <FormLabel htmlFor="name">Full Name</FormLabel>
                          <Input 
                            id="name" 
                            value={profileForm.name}
                            onChange={(e) => handleProfileChange("name", e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-1/2">
                          <FormLabel htmlFor="email">Email</FormLabel>
                          <Input 
                            id="email" 
                            value={profileForm.email}
                            onChange={(e) => handleProfileChange("email", e.target.value)}
                            disabled
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                          <FormLabel htmlFor="title">Title</FormLabel>
                          <Input 
                            id="title" 
                            value={profileForm.title}
                            onChange={(e) => handleProfileChange("title", e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-1/2">
                          <FormLabel htmlFor="organization">Organization</FormLabel>
                          <Input 
                            id="organization" 
                            value={profileForm.organization}
                            onChange={(e) => handleProfileChange("organization", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="bio">Bio</FormLabel>
                        <Input 
                          id="bio" 
                          value={profileForm.bio}
                          onChange={(e) => handleProfileChange("bio", e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                          <FormLabel htmlFor="language">Primary Language</FormLabel>
                          <Select 
                            value={profileForm.language} 
                            onValueChange={(value) => handleProfileChange("language", value)}
                          >
                            <SelectTrigger id="language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                              <SelectItem value="Chinese">Chinese</SelectItem>
                              <SelectItem value="Japanese">Japanese</SelectItem>
                              <SelectItem value="Korean">Korean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-full md:w-1/2">
                          <FormLabel htmlFor="timezone">Timezone</FormLabel>
                          <Select 
                            value={profileForm.timezone} 
                            onValueChange={(value) => handleProfileChange("timezone", value)}
                          >
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</SelectItem>
                              <SelectItem value="UTC-7 (Mountain Time)">UTC-7 (Mountain Time)</SelectItem>
                              <SelectItem value="UTC-6 (Central Time)">UTC-6 (Central Time)</SelectItem>
                              <SelectItem value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</SelectItem>
                              <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT)</SelectItem>
                              <SelectItem value="UTC+1 (Central European Time)">UTC+1 (Central European Time)</SelectItem>
                              <SelectItem value="UTC+8 (China Standard Time)">UTC+8 (China Standard Time)</SelectItem>
                              <SelectItem value="UTC+9 (Japan Standard Time)">UTC+9 (Japan Standard Time)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="profile-picture">Profile Picture</FormLabel>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={profileForm.profilePicture} alt={profileForm.name} />
                            <AvatarFallback>{profileForm.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Button variant="outline">
                            <Upload size={16} className="mr-2" />
                            Upload New Picture
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p>{profileForm.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p>{profileForm.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Title</h3>
                          <p>{profileForm.title}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Organization</h3>
                          <p>{profileForm.organization}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Primary Language</h3>
                          <p>{profileForm.language}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Timezone</h3>
                          <p>{profileForm.timezone}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                        <p>{profileForm.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meetings" className="mt-0" hidden={activeTab !== "meetings"}>
            <Card>
              <CardHeader>
                <CardTitle>Meeting History</CardTitle>
                <CardDescription>
                  View your past meetings and recordings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meeting</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Recording</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingHistory.map(meeting => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>{formatDate(meeting.date)}</TableCell>
                        <TableCell>{formatTime(meeting.duration)}</TableCell>
                        <TableCell>{meeting.participants}</TableCell>
                        <TableCell>
                          {meeting.recordingAvailable ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                              Not Available
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <FileText size={16} />
                            </Button>
                            {meeting.recordingAvailable && (
                              <Button variant="ghost" size="icon">
                                <Download size={16} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Export History
                </Button>
                <Button variant="outline">
                  View All Meetings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription" className="mt-0" hidden={activeTab !== "subscription"}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPlanBadge(subscription.plan)}
                    {getSubscriptionStatusBadge(subscription.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                        </h3>
                        {subscription.price && (
                          <p className="text-gray-500">${subscription.price}/month</p>
                        )}
                      </div>
                      <Button>Upgrade Plan</Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div className="flex-1">
                        <p className="font-medium mb-2">Plan Period</p>
                        <p>
                          {formatDate(subscription.startDate)} - {subscription.endDate ? formatDate(subscription.endDate) : 'Ongoing'}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">Next Billing Date</p>
                        <p>{subscription.endDate ? formatDate(subscription.endDate) : 'N/A'}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">Payment Method</p>
                        <p>
                          {subscription.paymentMethod?.type === 'credit_card' 
                            ? `Credit Card ending in ${subscription.paymentMethod.last4}` 
                            : subscription.paymentMethod?.type === 'paypal'
                            ? 'PayPal'
                            : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Plan Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Billing History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>{formatDate(new Date(Date.now() - 86400000 * 30))}</TableCell>
                          <TableCell>Pro Plan - Monthly Subscription</TableCell>
                          <TableCell>${subscription.price}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Paid
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Download size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <CreditCard size={16} className="mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline" className="text-red-500 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0" hidden={activeTab !== "settings"}>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive email notifications for meetings and updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Meeting Reminders</p>
                          <p className="text-sm text-gray-500">Receive reminders before scheduled meetings</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing Communications</p>
                          <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Language & Region</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel htmlFor="app-language">Application Language</FormLabel>
                          <Select defaultValue="en">
                            <SelectTrigger id="app-language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                              <SelectItem value="ko">Korean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <FormLabel htmlFor="app-timezone">Timezone</FormLabel>
                          <Select defaultValue="UTC-5">
                            <SelectTrigger id="app-timezone">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                              <SelectItem value="UTC-7">UTC-7 (Mountain Time)</SelectItem>
                              <SelectItem value="UTC-6">UTC-6 (Central Time)</SelectItem>
                              <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                              <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                              <SelectItem value="UTC+1">UTC+1 (Central European Time)</SelectItem>
                              <SelectItem value="UTC+8">UTC+8 (China Standard Time)</SelectItem>
                              <SelectItem value="UTC+9">UTC+9 (Japan Standard Time)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">
                          <Shield size={16} className="mr-2" />
                          Enable
                        </Button>
                      </div>
                      
                      <div>
                        <Button variant="outline">
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
                    <div className="space-y-4">
                      <div>
                        <Button variant="outline">
                          <Download size={16} className="mr-2" />
                          Download My Data
                        </Button>
                      </div>
                      
                      <div>
                        <Button variant="outline" className="text-red-500 hover:text-red-700">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;