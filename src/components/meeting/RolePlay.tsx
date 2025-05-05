import React, { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Edit,
  Send,
  Copy,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Shuffle,
  Save,
  FileText,
  BookOpen,
  Briefcase,
  MessageSquare
} from "lucide-react";
import { useAuth } from "contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Types
interface RolePlayCharacter {
  id: string;
  name: string;
  description: string;
  goals?: string;
  backgroundInfo?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
}

interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  setting?: string;
  situation?: string;
  characters: RolePlayCharacter[];
  creatorId: string;
  createdAt: Date;
  isActive: boolean;
  isPublic: boolean;
  language: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number; // in minutes
  tags: string[];
}

interface RolePlayProps {
  meetingId: string;
  isHost: boolean;
  participants: {
    id: string;
    name: string;
  }[];
}

const RolePlay: React.FC<RolePlayProps> = ({
  meetingId,
  isHost,
  participants
}) => {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<RolePlayScenario[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "active" | "create">("library");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeScenario, setActiveScenario] = useState<RolePlayScenario | null>(null);

  // Load saved scenarios from localStorage on component mount
  useEffect(() => {
    try {
      const savedScenarios = localStorage.getItem('rolePlayScenarios');
      if (savedScenarios) {
        const parsedScenarios = JSON.parse(savedScenarios);
        setScenarios(parsedScenarios);
      }
    } catch (error) {
      console.error('Error loading saved scenarios:', error);
    }
  }, []);

  // New scenario form state
  const [newScenario, setNewScenario] = useState<Omit<RolePlayScenario, "id" | "createdAt" | "creatorId" | "isActive">>({
    title: "",
    description: "",
    setting: "",
    situation: "",
    characters: [
      { id: "1", name: "", description: "" },
      { id: "2", name: "", description: "" }
    ],
    isPublic: true,
    language: "English",
    difficulty: "intermediate",
    estimatedDuration: 15,
    tags: []
  });

  // Sample scenarios for the library
  const sampleScenarios: RolePlayScenario[] = [
    {
      id: "sample1",
      title: "At the Restaurant",
      description: "Practice ordering food and making small talk at a restaurant.",
      setting: "A busy restaurant in the evening",
      situation: "A customer is dining at a restaurant and interacting with the waiter.",
      characters: [
        {
          id: "1",
          name: "Customer",
          description: "You are dining at a restaurant and want to order food. You have some dietary restrictions.",
          goals: "Order a meal that fits your dietary needs, ask about specials, and make small talk."
        },
        {
          id: "2",
          name: "Waiter/Waitress",
          description: "You work at the restaurant and need to take the customer's order and answer questions.",
          goals: "Provide good service, recommend dishes, and answer questions about the menu."
        }
      ],
      creatorId: "system",
      createdAt: new Date(),
      isActive: false,
      isPublic: true,
      language: "English",
      difficulty: "beginner",
      estimatedDuration: 10,
      tags: ["restaurant", "food", "service", "beginner"]
    },
    {
      id: "sample2",
      title: "Job Interview",
      description: "Practice a job interview for a position in your field.",
      setting: "A company office",
      situation: "A job candidate is being interviewed for a position at a company.",
      characters: [
        {
          id: "1",
          name: "Interviewer",
          description: "You are the hiring manager conducting an interview for an open position.",
          goals: "Assess the candidate's qualifications, experience, and fit for the role."
        },
        {
          id: "2",
          name: "Job Candidate",
          description: "You are applying for a job that matches your skills and experience.",
          goals: "Present yourself well, highlight your qualifications, and ask good questions about the role."
        }
      ],
      creatorId: "system",
      createdAt: new Date(),
      isActive: false,
      isPublic: true,
      language: "English",
      difficulty: "intermediate",
      estimatedDuration: 15,
      tags: ["interview", "job", "professional", "business"]
    },
    {
      id: "sample3",
      title: "Negotiating a Deal",
      description: "Practice negotiation skills in a business context.",
      setting: "A business meeting room",
      situation: "Two business representatives are negotiating a partnership deal.",
      characters: [
        {
          id: "1",
          name: "Company A Representative",
          description: "You represent a technology company looking to partner with Company B.",
          goals: "Secure a favorable deal for your company while maintaining a good relationship."
        },
        {
          id: "2",
          name: "Company B Representative",
          description: "You represent a marketing company that Company A wants to partner with.",
          goals: "Ensure your company gets fair terms and benefits from the partnership."
        }
      ],
      creatorId: "system",
      createdAt: new Date(),
      isActive: false,
      isPublic: true,
      language: "English",
      difficulty: "advanced",
      estimatedDuration: 20,
      tags: ["business", "negotiation", "advanced", "professional"]
    }
  ];

  // Add character to scenario
  const addCharacter = () => {
    setNewScenario((prev: Omit<RolePlayScenario, "id" | "createdAt" | "creatorId" | "isActive">) => ({
      ...prev,
      characters: [
        ...prev.characters,
        { id: (prev.characters.length + 1).toString(), name: "", description: "" }
      ]
    }));
  };

  // Remove character from scenario
  const removeCharacter = (index: number) => {
    if (newScenario.characters.length <= 2) {
      alert("A role play scenario must have at least 2 characters");
      return;
    }

    setNewScenario((prev: Omit<RolePlayScenario, "id" | "createdAt" | "creatorId" | "isActive">) => ({
      ...prev,
      characters: prev.characters.filter((_, i: number) => i !== index)
    }));
  };

  // Update character field
  const updateCharacterField = (index: number, field: keyof RolePlayCharacter, value: string) => {
    setNewScenario((prev: Omit<RolePlayScenario, "id" | "createdAt" | "creatorId" | "isActive">) => ({
      ...prev,
      characters: prev.characters.map((character, i: number) =>
        i === index ? { ...character, [field]: value } : character
      )
    }));
  };

  // Create a new scenario
  const handleCreateScenario = () => {
    // Validate scenario
    if (!newScenario.title.trim()) {
      alert("Please enter a scenario title");
      return;
    }

    if (!newScenario.description.trim()) {
      alert("Please enter a scenario description");
      return;
    }

    if (newScenario.characters.some((character: { name: string; description: string; }) => !character.name.trim() || !character.description.trim())) {
      alert("Please fill in all character names and descriptions");
      return;
    }

    const scenario: RolePlayScenario = {
      ...newScenario,
      id: Math.random().toString(36).substring(2, 9),
      creatorId: user?.email || "anonymous",
      createdAt: new Date(),
      isActive: false
    };

    // Update state with the new scenario
    const updatedScenarios = [...scenarios, scenario];
    setScenarios(updatedScenarios);
    setShowCreateDialog(false);

    // Show success message
    alert(`Scenario "${scenario.title}" created successfully! You can now start it from the library.`);

    // Store in localStorage for persistence
    try {
      localStorage.setItem('rolePlayScenarios', JSON.stringify(updatedScenarios));
    } catch (error) {
      console.error('Error saving scenario to localStorage:', error);
    }

    // Reset form
    setNewScenario({
      title: "",
      description: "",
      setting: "",
      situation: "",
      characters: [
        { id: "1", name: "", description: "" },
        { id: "2", name: "", description: "" }
      ],
      isPublic: true,
      language: "English",
      difficulty: "intermediate",
      estimatedDuration: 15,
      tags: []
    });

    // Switch to library tab to show the new scenario
    setActiveTab("library");
  };

  // Start a role play scenario
  const startScenario = (scenarioId: string) => {
    const scenario = [...scenarios, ...sampleScenarios].find(s => s.id === scenarioId);
    if (!scenario) return;

    // Assign random roles to participants if available
    const assignRoles = () => {
      if (participants.length > 0 && scenario.characters.length > 0) {
        // Create a copy of participants and shuffle them
        const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
        
        // Create a mapping of character IDs to participant IDs
        const roleAssignments: Record<string, string> = {};
        
        // Assign roles (up to the number of available participants)
        const maxAssignments = Math.min(shuffledParticipants.length, scenario.characters.length);
        for (let i = 0; i < maxAssignments; i++) {
          roleAssignments[scenario.characters[i].id] = shuffledParticipants[i].id;
        }
        
        return roleAssignments;
      }
      return {};
    };

    const roleAssignments = assignRoles();
    
    const activeScenario: RolePlayScenario = {
      ...scenario,
      isActive: true,
      characters: scenario.characters.map(character => ({
        ...character,
        assignedToUserId: roleAssignments[character.id],
        assignedToUserName: participants.find(p => p.id === roleAssignments[character.id])?.name
      }))
    };

    // If this is a sample scenario, add it to the user's scenarios
    if (sampleScenarios.some(s => s.id === scenarioId)) {
      const newScenarioId = Math.random().toString(36).substring(2, 9);
      const newScenario = { 
        ...scenario, 
        id: newScenarioId, 
        isActive: true,
        roleAssignments: roleAssignments
      };
      
      // Deactivate all other scenarios first
      const updatedScenarios = scenarios.map((s: any) => ({ ...s, isActive: false }));
      setScenarios([...updatedScenarios, newScenario]);

      // Store in localStorage
      try {
        localStorage.setItem('rolePlayScenarios', JSON.stringify([...updatedScenarios, newScenario]));
      } catch (error) {
        console.error('Error saving scenario to localStorage:', error);
      }

      // Set this as the active scenario
      setActiveScenario(newScenario);
    } else {
      // Update the scenario to be active and deactivate all others
      const updatedScenarios = scenarios.map((s: { id: string; }) =>
        s.id === scenarioId ? { ...s, isActive: true, roleAssignments: roleAssignments } : { ...s, isActive: false }
      );

      setScenarios(updatedScenarios as RolePlayScenario[]);

      // Update in localStorage
      try {
        localStorage.setItem('rolePlayScenarios', JSON.stringify(updatedScenarios));
      } catch (error) {
        console.error('Error updating scenarios in localStorage:', error);
      }

      setActiveScenario(activeScenario);
    }

    // Show success message with role assignments
    const roleMessage = Object.keys(roleAssignments).length > 0 
      ? `\n\nRoles have been automatically assigned to participants. You can adjust them in the Active Scenario tab.`
      : '';
      
    alert(`Scenario "${activeScenario.title}" started successfully! You can now assign roles to participants.${roleMessage}`);

    // Switch to active tab
    setActiveTab("active");
  };

  // End a role play scenario
  const endScenario = () => {
    if (!activeScenario) return;

    // Update the scenario to be inactive
    const updatedScenarios = scenarios.map((s: { id: any; }) =>
      s.id === activeScenario.id ? { ...s, isActive: false } : s
    );

    setScenarios(updatedScenarios as RolePlayScenario[]);

    // Update in localStorage
    localStorage.setItem('rolePlayScenarios', JSON.stringify(updatedScenarios));

    // Show message
    alert(`Scenario "${activeScenario.title}" has been ended.`);

    setActiveScenario(null);

    // Switch to library tab
    setActiveTab("library");
  };

  // Assign a character to a participant
  const assignCharacter = (characterId: string, userId: string, userName: string) => {
    if (!activeScenario) return;

    const updatedScenario: RolePlayScenario = {
      ...activeScenario,
      characters: activeScenario.characters.map((character: RolePlayCharacter) =>
        character.id === characterId
          ? { ...character, assignedToUserId: userId, assignedToUserName: userName }
          : character
      )
    };

    setActiveScenario(updatedScenario);

    // Update in the scenarios list too
    setScenarios((prev: RolePlayScenario[]) => prev.map((s: RolePlayScenario) =>
      s.id === activeScenario.id ? updatedScenario : s
    ));
  };

  // Unassign a character
  const unassignCharacter = (characterId: string) => {
    if (!activeScenario) return;

    const updatedScenario: RolePlayScenario = {
      ...activeScenario,
      characters: activeScenario.characters.map((character: RolePlayCharacter) =>
        character.id === characterId
          ? { ...character, assignedToUserId: undefined, assignedToUserName: undefined }
          : character
      )
    };

    setActiveScenario(updatedScenario);

    // Update in the scenarios list too
    setScenarios((prev: RolePlayScenario[]) => prev.map((s: RolePlayScenario) =>
      s.id === activeScenario.id ? updatedScenario : s
    ));
  };

  // Randomly assign characters to participants
  const randomlyAssignCharacters = () => {
    if (!activeScenario || participants.length < activeScenario.characters.length) {
      alert("Not enough participants to assign all characters");
      return;
    }

    // Shuffle participants
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);

    const updatedScenario: RolePlayScenario = {
      ...activeScenario,
      characters: activeScenario.characters.map((character: any, index: string | number) => ({
        ...character,
        assignedToUserId: shuffledParticipants[index as number].id,
        assignedToUserName: shuffledParticipants[index as number].name
      }))
    };

    setActiveScenario(updatedScenario);

    // Update in the scenarios list too
    setScenarios((prev: RolePlayScenario[]) => prev.map((s: RolePlayScenario) =>
      s.id === activeScenario.id ? updatedScenario : s
    ));
  };

  // Check if the current user is assigned to a character
  const getUserAssignedCharacter = () => {
    if (!activeScenario || !user) return null;

    return activeScenario.characters.find((character: RolePlayCharacter) => character.assignedToUserId === user.email);
  };

  // Duplicate a scenario
  const duplicateScenario = (scenarioId: string) => {
    const scenario = [...scenarios, ...sampleScenarios].find(s => s.id === scenarioId);
    if (!scenario) return;

    const newScenario: RolePlayScenario = {
      ...scenario,
      id: Math.random().toString(36).substring(2, 9),
      title: `${scenario.title} (Copy)`,
      creatorId: user?.email || "anonymous",
      createdAt: new Date(),
      isActive: false,
      characters: scenario.characters.map((character: any) => ({
        ...character,
        assignedToUserId: undefined,
        assignedToUserName: undefined
      }))
    };

    setScenarios((prev: RolePlayScenario[]) => [...prev, newScenario]);
  };

  // Delete a scenario
  const deleteScenario = (scenarioId: string) => {
    setScenarios((prev: RolePlayScenario[]) => prev.filter((s: { id: string; }) => s.id !== scenarioId));
  };

  return (
    <div className="role-play h-full flex flex-col">
      <div className="header flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Role Play</h2>

        {isHost && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Create Scenario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role Play Scenario</DialogTitle>
                <DialogDescription>
                  Create a scenario with characters for participants to role play.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <FormLabel htmlFor="scenario-title">Title</FormLabel>
                  <Input
                    id="scenario-title"
                    placeholder="Enter scenario title"
                    value={newScenario.title}
                    onChange={(e: { target: { value: any; }; }) => setNewScenario((prev: any) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <FormLabel htmlFor="scenario-description">Description</FormLabel>
                  <Textarea
                    id="scenario-description"
                    placeholder="Enter scenario description"
                    value={newScenario.description}
                    onChange={(e: { target: { value: any; }; }) => setNewScenario((prev: any) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <FormLabel htmlFor="scenario-setting">Setting (Optional)</FormLabel>
                  <Textarea
                    id="scenario-setting"
                    placeholder="Describe the setting of the scenario"
                    value={newScenario.setting || ""}
                    onChange={(e: { target: { value: any; }; }) => setNewScenario((prev: any) => ({ ...prev, setting: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <FormLabel htmlFor="scenario-situation">Situation (Optional)</FormLabel>
                  <Textarea
                    id="scenario-situation"
                    placeholder="Describe the situation or context"
                    value={newScenario.situation || ""}
                    onChange={(e: { target: { value: any; }; }) => setNewScenario((prev: any) => ({ ...prev, situation: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <FormLabel htmlFor="scenario-language">Language</FormLabel>
                    <Select
                      value={newScenario.language}
                      onValueChange={(value: any) => setNewScenario((prev: any) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger id="scenario-language">
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

                  <div className="grid gap-2">
                    <FormLabel htmlFor="scenario-difficulty">Difficulty</FormLabel>
                    <Select
                      value={newScenario.difficulty}
                      onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                        setNewScenario((prev: any) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger id="scenario-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <FormLabel htmlFor="scenario-duration">Estimated Duration (minutes)</FormLabel>
                  <Input
                    id="scenario-duration"
                    type="number"
                    min="5"
                    max="60"
                    value={newScenario.estimatedDuration}
                    onChange={(e: { target: { value: string; }; }) => setNewScenario((prev: any) => ({
                      ...prev,
                      estimatedDuration: parseInt(e.target.value) || 15
                    }))}
                  />
                </div>

                <div className="grid gap-2">
                  <FormLabel>Characters</FormLabel>
                  <div className="space-y-4">
                    {newScenario.characters.map((character: RolePlayCharacter, index: number) => (
                      <Card key={character.id}>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-center">
                            <FormLabel htmlFor={`character-${index}-name`}>Character {index + 1}</FormLabel>
                            {newScenario.characters.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCharacter(index)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <div className="grid gap-2">
                            <FormLabel htmlFor={`character-${index}-name`}>Name</FormLabel>
                            <Input
                              id={`character-${index}-name`}
                              placeholder="Character name"
                              value={character.name}
                              onChange={(e: { target: { value: string; }; }) => updateCharacterField(index, "name", e.target.value)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <FormLabel htmlFor={`character-${index}-description`}>Description</FormLabel>
                            <Textarea
                              id={`character-${index}-description`}
                              placeholder="Describe this character"
                              value={character.description}
                              onChange={(e: { target: { value: string; }; }) => updateCharacterField(index, "description", e.target.value)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <FormLabel htmlFor={`character-${index}-goals`}>Goals (Optional)</FormLabel>
                            <Textarea
                              id={`character-${index}-goals`}
                              placeholder="What are this character's goals in the scenario?"
                              value={character.goals || ""}
                              onChange={(e: { target: { value: string; }; }) => updateCharacterField(index, "goals", e.target.value)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <FormLabel htmlFor={`character-${index}-background`}>Background Info (Optional)</FormLabel>
                            <Textarea
                              id={`character-${index}-background`}
                              placeholder="Additional background information"
                              value={character.backgroundInfo || ""}
                              onChange={(e: { target: { value: string; }; }) => updateCharacterField(index, "backgroundInfo", e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addCharacter}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Character
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-scenario"
                    checked={newScenario.isPublic}
                    onCheckedChange={(checked: any) =>
                      setNewScenario((prev: any) => ({ ...prev, isPublic: checked }))
                    }
                  />
                  <label htmlFor="public-scenario" className="text-sm font-medium">
                    Make this scenario available to others in the meeting
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateScenario}>
                  Create Scenario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        defaultValue="library"
        className="flex-1 flex flex-col"
        onValueChange={(value: string) => setActiveTab(value as "library" | "active" | "create")}
        value={activeTab}
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="library" className="flex-1">
              Scenario Library
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              Active Scenario
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="library" className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* User's scenarios */}
              {scenarios.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Scenarios</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {scenarios.map((scenario: RolePlayScenario) => (
                      <Card key={scenario.id} className="h-full flex flex-col">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{scenario.title}</CardTitle>
                            <div className="flex gap-1">
                              <Badge variant={scenario.difficulty === "beginner" ? "outline" :
                                scenario.difficulty === "intermediate" ? "secondary" : "destructive"}>
                                {scenario.difficulty}
                              </Badge>
                              <Badge variant="outline">{scenario.language}</Badge>
                            </div>
                          </div>
                          <CardDescription>{scenario.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 mb-2">
                              <Users size={16} />
                              <span>{scenario.characters.length} characters</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              <Clock size={16} />
                              <span>~{scenario.estimatedDuration} minutes</span>
                            </div>
                            {scenario.setting && (
                              <div className="mb-2">
                                <span className="font-medium">Setting:</span> {scenario.setting}
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex gap-2">
                            <Button onClick={() => startScenario(scenario.id)}>
                              Start
                            </Button>
                            <Button variant="outline" onClick={() => duplicateScenario(scenario.id)}>
                              <Copy size={16} />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteScenario(scenario.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample scenarios */}
              <div>
                <h3 className="text-lg font-medium mb-2">Sample Scenarios</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {sampleScenarios.map(scenario => (
                    <Card key={scenario.id} className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{scenario.title}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant={scenario.difficulty === "beginner" ? "outline" :
                              scenario.difficulty === "intermediate" ? "secondary" : "destructive"}>
                              {scenario.difficulty}
                            </Badge>
                            <Badge variant="outline">{scenario.language}</Badge>
                          </div>
                        </div>
                        <CardDescription>{scenario.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 mb-2">
                            <Users size={16} />
                            <span>{scenario.characters.length} characters</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            <Clock size={16} />
                            <span>~{scenario.estimatedDuration} minutes</span>
                          </div>
                          {scenario.setting && (
                            <div className="mb-2">
                              <span className="font-medium">Setting:</span> {scenario.setting}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex gap-2">
                          <Button onClick={() => startScenario(scenario.id)}>
                            Start
                          </Button>
                          <Button variant="outline" onClick={() => duplicateScenario(scenario.id)}>
                            <Copy size={16} />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="active" className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-full">
            {!activeScenario ? (
              <div className="text-center py-8 text-gray-500">
                No active scenario. Start a scenario from the library.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{activeScenario.title}</h3>
                    <p className="text-gray-600">{activeScenario.description}</p>
                  </div>

                  {isHost && (
                    <Button variant="destructive" onClick={endScenario}>
                      End Scenario
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Scenario Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Setting</h4>
                        <p className="text-sm">{activeScenario.setting || "No specific setting provided."}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-1">Situation</h4>
                        <p className="text-sm">{activeScenario.situation || "No specific situation provided."}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{activeScenario.language}</Badge>
                        <Badge variant={activeScenario.difficulty === "beginner" ? "outline" :
                          activeScenario.difficulty === "intermediate" ? "secondary" : "destructive"}>
                          {activeScenario.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Clock size={14} className="mr-1" />
                          ~{activeScenario.estimatedDuration} min
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Characters</CardTitle>
                      {isHost && (
                        <Button variant="outline" size="sm" onClick={randomlyAssignCharacters}>
                          <Shuffle size={14} className="mr-1" />
                          Assign Randomly
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activeScenario.characters.map((character: RolePlayCharacter) => (
                        <div key={character.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{character.name}</h4>
                            {isHost ? (
                              <Select
                                value={character.assignedToUserId || ""}
                                onValueChange={(value: string) => {
                                  if (value === "") {
                                    unassignCharacter(character.id);
                                  } else {
                                    const participant = participants.find((p: { id: any; }) => p.id === value);
                                    if (participant) {
                                      assignCharacter(character.id, participant.id, participant.name);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Unassigned</SelectItem>
                                  {participants.map((participant: { id: any; name: any; }) => (
                                    <SelectItem key={participant.id} value={participant.id}>
                                      {participant.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              character.assignedToUserName && (
                                <Badge>
                                  <UserCheck size={14} className="mr-1" />
                                  {character.assignedToUserName}
                                </Badge>
                              )
                            )}
                          </div>

                          <p className="text-sm mb-2">{character.description}</p>

                          {character.goals && (
                            <div className="text-sm mb-2">
                              <span className="font-medium">Goals:</span> {character.goals}
                            </div>
                          )}

                          {character.backgroundInfo && (
                            <div className="text-sm">
                              <span className="font-medium">Background:</span> {character.backgroundInfo}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* User's assigned character */}
                {getUserAssignedCharacter() && (
                  <Card className="border-2 border-blue-500">
                    <CardHeader className="bg-blue-50">
                      <CardTitle>Your Role: {getUserAssignedCharacter()?.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <h4 className="font-medium mb-1">Description</h4>
                        <p>{getUserAssignedCharacter()?.description}</p>
                      </div>

                      {getUserAssignedCharacter()?.goals && (
                        <div>
                          <h4 className="font-medium mb-1">Your Goals</h4>
                          <p>{getUserAssignedCharacter()?.goals}</p>
                        </div>
                      )}

                      {getUserAssignedCharacter()?.backgroundInfo && (
                        <div>
                          <h4 className="font-medium mb-1">Background Information</h4>
                          <p>{getUserAssignedCharacter()?.backgroundInfo}</p>
                        </div>
                      )}

                      <div className="pt-4">
                        <Button variant="outline" className="w-full">
                          <MessageSquare size={16} className="mr-2" />
                          Start Conversation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RolePlay;












