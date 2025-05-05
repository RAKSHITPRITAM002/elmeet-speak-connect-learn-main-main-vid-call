
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  FileText, 
  ListChecks, 
  Languages, 
  MessageCircle,
  PanelRightOpen
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LanguageToolbarProps {
  onOpenDictionary?: () => void;
  onOpenTimer?: () => void;
  onOpenNotes?: () => void;
  onOpenQuiz?: () => void;
  onOpenTranslation?: () => void;
  onOpenRolePlay?: () => void;
}

export const LanguageToolbar = ({
  onOpenDictionary,
  onOpenTimer,
  onOpenNotes,
  onOpenQuiz,
  onOpenTranslation,
  onOpenRolePlay
}: LanguageToolbarProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-2 flex items-center justify-center space-x-2">
      <TooltipProvider>
        {onOpenDictionary && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={onOpenDictionary}
              >
                <BookOpen size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dictionary</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onOpenTimer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={onOpenTimer}
              >
                <Clock size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Timer</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onOpenNotes && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={onOpenNotes}
              >
                <FileText size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Shared Notes</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onOpenQuiz && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={onOpenQuiz}
              >
                <ListChecks size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quiz</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onOpenTranslation && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={onOpenTranslation}
              >
                <Languages size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Translation</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onOpenRolePlay && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={onOpenRolePlay}
              >
                <MessageCircle size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Role Play</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
