import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

const feedbackTypes = [
  { value: "bug", label: "Bug Report" },
  { value: "ui", label: "UI Improvement" },
  { value: "functionality", label: "Functionality Improvement" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" }
];

const FeedbackDialog = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {


    toast({
      title: "Feedback is not currently being stored right now.",
      description: "Submit a bug report to fix this!",
      variant: "destructive"
    })

    console.log({ type, description });
    setType("");
    setDescription("");

    setIsOpen(false);


  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MessageSquarePlus className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback, reporting bugs, or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="feedback-type" className="text-sm font-medium">
              Feedback Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((feedbackType) => (
                  <SelectItem key={feedbackType.value} value={feedbackType.value}>
                    {feedbackType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your feedback in detail..."
              className="h-32"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!type || !description}
          >
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;