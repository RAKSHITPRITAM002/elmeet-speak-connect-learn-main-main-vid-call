import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  PieChart,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Send,
  Eye,
  EyeOff,
  Copy,
  BarChart4,
  PieChart as PieChartIcon
} from "lucide-react";
import { useAuth } from "contexts/AuthContext";

// Types
type PollType = "multiple-choice" | "single-choice" | "open-ended";
type PollStatus = "draft" | "active" | "ended";

interface PollOption {
  id: string;
  text: string;
}

interface PollResponse {
  userId: string;
  userName: string;
  answers: string[]; // Option IDs or text for open-ended
  timestamp: Date;
}

interface Poll {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  type: PollType;
  options: PollOption[];
  isAnonymous: boolean;
  showResultsImmediately: boolean;
  status: PollStatus;
  createdAt: Date;
  endedAt?: Date;
  responses: PollResponse[];
}

interface PollsAndQuizzesProps {
  meetingId: string;
  isHost: boolean;
  participants: {
    id: string;
    name: string;
  }[];
}

const PollsAndQuizzes: React.FC<PollsAndQuizzesProps> = ({
  meetingId,
  isHost,
  participants
}) => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activeTab, setActiveTab] = useState<"polls" | "results">("polls");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPoll, setNewPoll] = useState<Omit<Poll, "id" | "createdAt" | "responses" | "status">>({
    creatorId: user?.email || "",
    title: "",
    description: "",
    type: "single-choice",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" }
    ],
    isAnonymous: false,
    showResultsImmediately: true
  });

  // Load saved polls from localStorage on component mount
  useEffect(() => {
    try {
      const savedPolls = localStorage.getItem('polls');
      if (savedPolls) {
        const parsedPolls = JSON.parse(savedPolls);
        setPolls(parsedPolls);
      }
    } catch (error) {
      console.error('Error loading saved polls:', error);
    }
  }, []);

  // User's responses to active polls
  const [userResponses, setUserResponses] = useState<{
    [pollId: string]: string[] // Option IDs or text
  }>({});

  // Create a new poll
  const handleCreatePoll = () => {
    // Validate poll
    if (!newPoll.title.trim()) {
      alert("Please enter a poll title");
      return;
    }

    if (newPoll.type !== "open-ended" && newPoll.options.some((option: { text: string; }) => !option.text.trim())) {
      alert("Please fill in all options");
      return;
    }

    const poll: Poll = {
      ...newPoll,
      id: Math.random().toString(36).substring(2, 9),
      status: "draft",
      createdAt: new Date(),
      responses: []
    };

    // Save to localStorage for persistence
    try {
      const existingPolls = JSON.parse(localStorage.getItem('polls') || '[]');
      localStorage.setItem('polls', JSON.stringify([...existingPolls, poll]));
    } catch (error) {
      console.error('Error saving poll to localStorage:', error);
    }

    setPolls((prev: any) => [...prev, poll]);
    setShowCreateDialog(false);

    // Show success message
    alert(`Poll "${poll.title}" created successfully! You can now launch it to make it available to participants.`);

    // Reset form
    setNewPoll({
      creatorId: user?.email || "",
      title: "",
      description: "",
      type: "single-choice",
      options: [
        { id: "1", text: "" },
        { id: "2", text: "" }
      ],
      isAnonymous: false,
      showResultsImmediately: true
    });
  };

  // Add option to poll
  const addOption = () => {
    setNewPoll((prev: Omit<Poll, "id" | "createdAt" | "responses" | "status">) => ({
      ...prev,
      options: [
        ...prev.options,
        { id: (prev.options.length + 1).toString(), text: "" }
      ]
    }));
  };

  // Remove option from poll
  const removeOption = (index: number) => {
    if (newPoll.options.length <= 2) {
      alert("A poll must have at least 2 options");
      return;
    }

    setNewPoll((prev: Omit<Poll, "id" | "createdAt" | "responses" | "status">) => ({
      ...prev,
      options: prev.options.filter((_: any, i: number) => i !== index)
    }));
  };

  // Update option text
  const updateOptionText = (index: number, text: string) => {
    setNewPoll((prev: Omit<Poll, "id" | "createdAt" | "responses" | "status">) => ({
      ...prev,
      options: prev.options.map((option: PollOption, i: number) =>
        i === index ? { ...option, text } : option
      )
    }));
  };

  // Launch poll
  const launchPoll = (pollId: string) => {
    const updatedPolls = polls.map((poll: { id: string; }) =>
      poll.id === pollId ? { ...poll, status: "active" } : poll
    );
    
    setPolls(updatedPolls as Poll[]);
    
    // Update in localStorage
    try {
      localStorage.setItem('polls', JSON.stringify(updatedPolls));
    } catch (error) {
      console.error('Error updating poll status in localStorage:', error);
    }
  };

  // End poll
  const endPoll = (pollId: string) => {
    const updatedPolls = polls.map((poll: { id: string; }) =>
      poll.id === pollId ? { ...poll, status: "ended", endedAt: new Date() } : poll
    );
    
    setPolls(updatedPolls as Poll[]);
    
    // Update in localStorage
    try {
      localStorage.setItem('polls', JSON.stringify(updatedPolls));
    } catch (error) {
      console.error('Error updating poll status in localStorage:', error);
    }
  };

  // Delete poll
  const deletePoll = (pollId: string) => {
    const updatedPolls = polls.filter((poll: { id: string; }) => poll.id !== pollId);
    
    setPolls(updatedPolls);
    
    // Update in localStorage
    try {
      localStorage.setItem('polls', JSON.stringify(updatedPolls));
    } catch (error) {
      console.error('Error deleting poll from localStorage:', error);
    }
  };

  // Submit response to poll
  const submitResponse = (pollId: string) => {
    const poll = polls.find((p: { id: string; }) => p.id === pollId);
    if (!poll) return;

    const response: PollResponse = {
      userId: user?.email || "anonymous",
      userName: user?.name || "Anonymous",
      answers: userResponses[pollId] || [],
      timestamp: new Date()
    };

    const updatedPolls = polls.map((p: { id: string; responses: any; }) =>
      p.id === pollId
        ? { ...p, responses: [...p.responses, response] }
        : p
    );
    
    setPolls(updatedPolls as Poll[]);
    
    // Update in localStorage
    try {
      localStorage.setItem('polls', JSON.stringify(updatedPolls));
    } catch (error) {
      console.error('Error saving poll response to localStorage:', error);
    }

    // Clear user response for this poll
    setUserResponses((prev: any) => {
      const newResponses = { ...prev };
      delete newResponses[pollId];
      return newResponses;
    });
    
    // Show confirmation message
    alert("Your response has been submitted successfully!");
  };

  // Handle single choice selection
  const handleSingleChoiceSelect = (pollId: string, optionId: string) => {
    setUserResponses((prev: any) => ({
      ...prev,
      [pollId]: [optionId]
    }));
  };

  // Handle multiple choice selection
  const handleMultipleChoiceSelect = (pollId: string, optionId: string, checked: boolean) => {
    setUserResponses((prev: { [pollId: string]: string[] }) => {
      const currentSelections = prev[pollId] || [];

      if (checked) {
        return {
          ...prev,
          [pollId]: [...currentSelections, optionId]
        };
      } else {
        return {
          ...prev,
          [pollId]: currentSelections.filter((id: string) => id !== optionId)
        };
      }
    });
  };

  // Handle open-ended response
  const handleOpenEndedResponse = (pollId: string, text: string) => {
    setUserResponses((prev: any) => ({
      ...prev,
      [pollId]: [text]
    }));
  };

  // Calculate poll results
  const calculateResults = (poll: Poll) => {
    const results: { [optionId: string]: number } = {};

    // Initialize results
    poll.options.forEach(option => {
      results[option.id] = 0;
    });

    // Count responses
    poll.responses.forEach(response => {
      response.answers.forEach(answer => {
        // For open-ended questions, we don't count in the chart
        if (poll.type !== "open-ended" && results[answer] !== undefined) {
          results[answer]++;
        }
      });
    });

    return results;
  };

  // Check if user has already responded to a poll
  const hasUserResponded = (pollId: string) => {
    const poll = polls.find((p: { id: string; }) => p.id === pollId);
    if (!poll) return false;

    return poll.responses.some((response: { userId: any; }) => response.userId === user?.email);
  };

  // Duplicate poll
  const duplicatePoll = (pollId: string) => {
    const poll = polls.find((p: { id: string; }) => p.id === pollId);
    if (!poll) return;

    const newPoll: Poll = {
      ...poll,
      id: Math.random().toString(36).substring(2, 9),
      title: `${poll.title} (Copy)`,
      status: "draft",
      createdAt: new Date(),
      responses: []
    };

    setPolls((prev: any) => [...prev, newPoll]);
  };

  return (
    <div className="polls-and-quizzes h-full flex flex-col">
      <div className="header flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Polls & Quizzes</h2>

        {isHost && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
                <DialogDescription>
                  Create a poll or quiz to gather feedback from participants.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <FormLabel htmlFor="poll-title">Title</FormLabel>
                  <Input
                    id="poll-title"
                    placeholder="Enter poll title"
                    value={newPoll.title}
                    onChange={(e: { target: { value: any; }; }) => setNewPoll((prev: any) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <FormLabel htmlFor="poll-description">Description (Optional)</FormLabel>
                  <Textarea
                    id="poll-description"
                    placeholder="Enter poll description"
                    value={newPoll.description || ""}
                    onChange={(e: { target: { value: any; }; }) => setNewPoll((prev: any) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <FormLabel>Poll Type</FormLabel>
                  <RadioGroup
                    value={newPoll.type}
                    onValueChange={(value: PollType) => setNewPoll((prev: any) => ({ ...prev, type: value }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single-choice" id="single-choice" />
                      <FormLabel htmlFor="single-choice">Single Choice</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple-choice" id="multiple-choice" />
                      <FormLabel htmlFor="multiple-choice">Multiple Choice</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="open-ended" id="open-ended" />
                      <FormLabel htmlFor="open-ended">Open Ended</FormLabel>
                    </div>
                  </RadioGroup>
                </div>

                {newPoll.type !== "open-ended" && (
                  <div className="grid gap-2">
                    <FormLabel>Options</FormLabel>
                    <div className="space-y-2">
                      {newPoll.options.map((option: { id: any; text: any; }, index: number) => (
                        <div key={option.id} className="flex gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(e: { target: { value: string; }; }) => updateOptionText(index, e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addOption}
                        className="w-full"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={newPoll.isAnonymous}
                      onCheckedChange={(checked: boolean) =>
                        setNewPoll((prev: any) => ({ ...prev, isAnonymous: checked === true }))
                      }
                    />
                    <label htmlFor="anonymous" className="text-sm font-medium">
                      Anonymous Responses
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-results"
                      checked={newPoll.showResultsImmediately}
                      onCheckedChange={(checked: boolean) =>
                        setNewPoll((prev: any) => ({ ...prev, showResultsImmediately: checked === true }))
                      }
                    />
                    <label htmlFor="show-results" className="text-sm font-medium">
                      Show Results Immediately
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePoll}>
                  Create Poll
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        defaultValue="polls"
        className="flex-1 flex flex-col"
        onValueChange={(value: string) => setActiveTab(value as "polls" | "results")}
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="polls" className="flex-1">
              Active Polls
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1">
              Results
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="polls" className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-full">
            {polls.filter((poll: { status: string; }) => poll.status !== "ended").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isHost
                  ? "No active polls. Create a poll to get started."
                  : "No active polls at the moment."}
              </div>
            ) : (
              <div className="space-y-4">
                {polls
                  .filter((poll: { status: string; }) => poll.status !== "ended")
                  .map((poll: Poll) => (
                    <Card key={poll.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{poll.title}</CardTitle>
                            {poll.description && (
                              <CardDescription>{poll.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {poll.status === "active" ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                                <Clock size={12} className="mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                                <Clock size={12} className="mr-1" />
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {poll.status === "active" && !hasUserResponded(poll.id) ? (
                          <div className="space-y-4">
                            {poll.type === "single-choice" && (
                              <RadioGroup
                                value={userResponses[poll.id]?.[0] || ""}
                                onValueChange={(value: string) => handleSingleChoiceSelect(poll.id, value)}
                              >
                                {poll.options.map((option: { id: any; text: any; }) => (
                                  <div key={option.id} className="flex items-center space-x-2 py-1">
                                    <RadioGroupItem value={option.id} id={`${poll.id}-${option.id}`} />
                                    <FormLabel htmlFor={`${poll.id}-${option.id}`}>{option.text}</FormLabel>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {poll.type === "multiple-choice" && (
                              <div className="space-y-2">
                                {poll.options.map((option: { id: string; text: any; }) => (
                                  <div key={option.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${poll.id}-${option.id}`}
                                      checked={(userResponses[poll.id] || []).includes(option.id)}
                                      onCheckedChange={(checked: boolean) =>
                                        handleMultipleChoiceSelect(poll.id, option.id, checked === true)
                                      }
                                    />
                                    <label htmlFor={`${poll.id}-${option.id}`} className="text-sm">
                                      {option.text}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}

                            {poll.type === "open-ended" && (
                              <Textarea
                                placeholder="Type your answer here..."
                                value={userResponses[poll.id]?.[0] || ""}
                                onChange={(e: { target: { value: string; }; }) => handleOpenEndedResponse(poll.id, e.target.value)}
                              />
                            )}
                          </div>
                        ) : poll.status === "active" && hasUserResponded(poll.id) ? (
                          <div>
                            <div className="text-green-600 flex items-center mb-4">
                              <CheckCircle size={16} className="mr-2" />
                              You have responded to this poll
                            </div>

                            {poll.showResultsImmediately && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Current Results:</h4>
                                {poll.type !== "open-ended" ? (
                                  <div className="space-y-2">
                                    {poll.options.map((option: { id: string | number; text: any; }) => {
                                      const results = calculateResults(poll);
                                      const count = results[option.id] || 0;
                                      const total = poll.responses.length;
                                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                                      return (
                                        <div key={option.id} className="space-y-1">
                                          <div className="flex justify-between text-sm">
                                            <span>{option.text}</span>
                                            <span>{count} ({percentage}%)</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                              className="bg-blue-600 h-2 rounded-full"
                                              style={{ width: `${percentage}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    Open-ended responses are available in the Results tab.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            This poll is not active yet.
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        {isHost ? (
                          <div className="flex gap-2">
                            {poll.status === "draft" ? (
                              <Button onClick={() => launchPoll(poll.id)}>
                                <Send size={16} className="mr-2" />
                                Launch Poll
                              </Button>
                            ) : (
                              <Button variant="destructive" onClick={() => endPoll(poll.id)}>
                                End Poll
                              </Button>
                            )}
                            <Button variant="outline" onClick={() => deletePoll(poll.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            {poll.status === "active" && !hasUserResponded(poll.id) && (
                              <Button onClick={() => submitResponse(poll.id)}>
                                Submit Response
                              </Button>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {poll.responses.length} {poll.responses.length === 1 ? "response" : "responses"}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="results" className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-full">
            {polls.filter((poll: { status: string; responses: string | any[]; }) => poll.status === "ended" || poll.responses.length > 0).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No poll results available.
              </div>
            ) : (
              <div className="space-y-4">
                {polls
                  .filter((poll: { status: string; responses: string | any[]; }) => poll.status === "ended" || poll.responses.length > 0)
                  .map((poll: Poll) => (
                    <Card key={poll.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{poll.title}</CardTitle>
                            {poll.description && (
                              <CardDescription>{poll.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {poll.status === "ended" ? (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center">
                                <Clock size={12} className="mr-1" />
                                Ended
                              </span>
                            ) : poll.status === "active" ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                                <Clock size={12} className="mr-1" />
                                Active
                              </span>
                            ) : null}

                            {isHost && (
                              <Button variant="ghost" size="icon" onClick={() => duplicatePoll(poll.id)}>
                                <Copy size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {poll.type !== "open-ended" ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Results</h4>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <BarChart4 size={16} className="mr-1" />
                                  Bar
                                </Button>
                                <Button variant="outline" size="sm">
                                  <PieChartIcon size={16} className="mr-1" />
                                  Pie
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {poll.options.map((option: { id: string | number; text: any; }) => {
                                const results = calculateResults(poll);
                                const count = results[option.id] || 0;
                                const total = poll.responses.length;
                                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                                return (
                                  <div key={option.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{option.text}</span>
                                      <span>{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Responses</h4>
                            {poll.responses.length === 0 ? (
                              <div className="text-sm text-gray-500">
                                No responses yet.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {poll.responses.map((response: { userName: any; timestamp: { toLocaleString: () => any; }; answers: any[]; }, index: any) => (
                                  <div key={index} className="border p-3 rounded-md">
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="text-sm font-medium">
                                        {poll.isAnonymous ? "Anonymous" : response.userName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {response.timestamp.toLocaleString()}
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      {response.answers[0]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="text-xs text-gray-500">
                          {poll.responses.length} {poll.responses.length === 1 ? "response" : "responses"}
                          {poll.endedAt && ` • Ended ${poll.endedAt.toLocaleString()}`}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PollsAndQuizzes;








