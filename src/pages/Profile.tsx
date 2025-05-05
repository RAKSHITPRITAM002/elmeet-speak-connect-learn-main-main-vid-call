import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  User, Settings, CreditCard, Clock, Calendar, LogOut,
  Shield, Bell, Key, HelpCircle, FileText, BarChart4
} from "lucide-react";

// Types
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
  features: string[];
  price: number;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [meetingHistory, setMeetingHistory] = useState<MeetingHistory[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load user data
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For this example, we'll use mock data

    // Mock meeting history
    const mockMeetingHistory: MeetingHistory[] = [
      {
        id: "meet-1",
        title: "Team Weekly Sync",
        date: new Date(Date.now() - 86400000 * 2), // 2 days ago
        duration: 45,
        participants: 8,
        recordingAvailable: true
      },
      {
        id: "meet-2",
        title: "Project Kickoff",
        date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        duration: 60,
        participants: 12,
        recordingAvailable: true
      },
      {
        id: "meet-3",
        title: "Client Presentation",
        date: new Date(Date.now() - 86400000 * 7), // 7 days ago
        duration: 30,
        participants: 5,
        recordingAvailable: false
      },
      {
        id: "meet-4",
        title: "Language Practice Session",
        date: new Date(Date.now() - 86400000 * 10), // 10 days ago
        duration: 90,
        participants: 3,
        recordingAvailable: true
      }
    ];

    // Mock subscription
    const mockSubscription: Subscription = {
      plan: "pro",
      status: "active",
      startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
      endDate: new Date(Date.now() + 86400000 * 335), // 335 days from now
      features: [
        "Unlimited meetings",
        "Up to 100 participants",
        "Meeting duration up to 24 hours",
        "Cloud recording (50GB)",
        "Advanced language tools",
        "Custom virtual backgrounds",
        "Polls and quizzes",
        "Role play scenarios",
        "Multimedia player",
        "Priority support"
      ],
      price: 19.99,
      billingCycle: "monthly",
      autoRenew: true
    };

    setMeetingHistory(mockMeetingHistory);
    setSubscription(mockSubscription);
  }, []);

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    return `${mins}m`;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // If not authenticated, show loading
  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-3 py-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.picture || ""} alt={user?.name || "User"} />
                      <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-bold">{user?.name}</h2>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    {subscription && (
                      <Badge className={
                        subscription.plan === "free" ? "bg-gray-500" :
                        subscription.plan === "basic" ? "bg-blue-500" :
                        subscription.plan === "pro" ? "bg-purple-500" :
                        "bg-green-500"
                      }>
                        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    <Button
                      variant={activeTab === "account" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("account")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Button>
                    <Button
                      variant={activeTab === "subscription" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        console.log("Subscription button clicked");
                        setActiveTab("subscription");
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscription
                    </Button>
                    <Button
                      variant={activeTab === "history" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("history")}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Meeting History
                    </Button>
                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        console.log("Settings button clicked");
                        setActiveTab("settings");
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="flex-1">
              {activeTab === "account" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Manage your personal information and account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <div className="mt-1 p-2 border rounded">{user?.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <div className="mt-1 p-2 border rounded">{user?.email}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Account Created</label>
                        <div className="mt-1 p-2 border rounded">
                          {user?.createdAt ? formatDate(new Date(user.createdAt)) : "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Login</label>
                        <div className="mt-1 p-2 border rounded">
                          {user?.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-2">Account Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("settings");
                            // In a real app, this would scroll to the password section
                          }}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Change Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("settings");
                            // In a real app, this would scroll to the notifications section
                          }}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Notification Settings
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("settings");
                            // In a real app, this would scroll to the security section
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Security Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "subscription" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your subscription plan and billing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {subscription ? (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className={`text-xl font-bold ${
                                subscription.plan === "free" ? "text-gray-700" :
                                subscription.plan === "basic" ? "text-blue-700" :
                                subscription.plan === "pro" ? "text-purple-700" :
                                "text-green-700"
                              }`}>
                                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                              </h3>
                              <p className="text-sm text-gray-500">
                                {subscription.status === "active" ? "Active" :
                                 subscription.status === "canceled" ? "Canceled" : "Expired"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">${subscription.price.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">
                                per {subscription.billingCycle === "monthly" ? "month" : "year"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-between text-sm">
                            <div>
                              <div className="font-medium">Started on</div>
                              <div>{formatDate(subscription.startDate)}</div>
                            </div>
                            {subscription.endDate && (
                              <div>
                                <div className="font-medium">Renews on</div>
                                <div>{formatDate(subscription.endDate)}</div>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">Auto-renew</div>
                              <div>{subscription.autoRenew ? "Enabled" : "Disabled"}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Plan Features</h3>
                          <ul className="space-y-2">
                            {subscription.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => navigate("/pricing")}>Upgrade Plan</Button>
                          <Button variant="outline" onClick={() => navigate("/subscription/billing")}>Manage Billing</Button>
                          {subscription.status === "active" && (
                            <Button
                              variant="outline"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) {
                                  console.log("Subscription cancelled");
                                  // In a real app, this would call an API to cancel the subscription
                                  alert("Your subscription has been canceled. You will have access until the end of your current billing period.");
                                }
                              }}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You don't have an active subscription.</p>
                        <Button onClick={() => navigate("/pricing")}>Choose a Plan</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "history" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting History</CardTitle>
                    <CardDescription>View your past meetings and recordings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meetingHistory.length > 0 ? (
                      <div className="space-y-4">
                        {meetingHistory.map(meeting => (
                          <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{meeting.title}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                  {formatDate(meeting.date)} at {formatTime(meeting.date)}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatDuration(meeting.duration)}
                                  </div>
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {meeting.participants} participants
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {meeting.recordingAvailable && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      console.log(`Viewing recording for meeting ${meeting.id}`);
                                      // In a real app, this would open the recording player
                                      alert(`Opening recording for "${meeting.title}"`);
                                    }}
                                  >
                                    View Recording
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log(`Viewing details for meeting ${meeting.id}`);
                                    // In a real app, this would navigate to the meeting details page
                                    alert(`Opening details for "${meeting.title}"`);
                                  }}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">You haven't hosted any meetings yet.</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("Calendar view clicked");
                        // In a real app, this would switch to a calendar view
                        alert("Calendar view is not available in this demo");
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("Export history clicked");
                        // In a real app, this would export the meeting history
                        alert("Exporting meeting history as CSV...");
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export History
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "settings" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Customize your meeting experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="general">
                      <TabsList className="mb-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="audio">Audio</TabsTrigger>
                        <TabsTrigger value="video">Video</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      </TabsList>

                      <TabsContent value="general" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Language</h3>
                            <p className="text-sm text-gray-500">Select your preferred language</p>
                          </div>
                          <select className="border rounded p-2">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Japanese</option>
                            <option>Korean</option>
                            <option>Chinese</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Time Zone</h3>
                            <p className="text-sm text-gray-500">Set your local time zone</p>
                          </div>
                          <select className="border rounded p-2">
                            <option>UTC-08:00 Pacific Time</option>
                            <option>UTC-05:00 Eastern Time</option>
                            <option>UTC+00:00 GMT</option>
                            <option>UTC+01:00 Central European Time</option>
                            <option>UTC+08:00 China Standard Time</option>
                            <option>UTC+09:00 Japan Standard Time</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Theme</h3>
                            <p className="text-sm text-gray-500">Choose light or dark mode</p>
                          </div>
                          <select className="border rounded p-2">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                          </select>
                        </div>
                      </TabsContent>

                      <TabsContent value="audio" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Automatically Mute on Join</h3>
                            <p className="text-sm text-gray-500">Mute your microphone when joining meetings</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Noise Suppression</h3>
                            <p className="text-sm text-gray-500">Reduce background noise in meetings</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Echo Cancellation</h3>
                            <p className="text-sm text-gray-500">Prevent audio echo during meetings</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </TabsContent>

                      <TabsContent value="video" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Turn Off Video on Join</h3>
                            <p className="text-sm text-gray-500">Disable camera when joining meetings</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Mirror My Video</h3>
                            <p className="text-sm text-gray-500">Show your video mirrored to yourself</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">HD Video</h3>
                            <p className="text-sm text-gray-500">Use high definition video when available</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </TabsContent>

                      <TabsContent value="notifications" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-gray-500">Receive meeting invites and reminders</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Browser Notifications</h3>
                            <p className="text-sm text-gray-500">Show desktop notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Sound Notifications</h3>
                            <p className="text-sm text-gray-500">Play sounds for meeting events</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => {
                      console.log("Settings saved");
                      // In a real app, this would save the settings to the backend
                      alert("Settings saved successfully!");
                    }}>Save Settings</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;