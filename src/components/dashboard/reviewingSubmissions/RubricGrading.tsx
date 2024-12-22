import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IRubricItem } from '@@/models/Assignment'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, MessageSquare, X, Check } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

interface RubricGradingProps {
  rubric: IRubricItem[];
  appliedRubricItemIds: string[];
  onRubricChange: (appliedRubricItemIds: string[]) => void;
  onRubricItemEdit: (itemId: string, newDescription: string, newPoints: number) => void;
  onAIFeedback: (itemId: string, feedback: string, shouldApply: 'should' | 'should-not' | 'correct') => void;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
}

export function RubricGrading({
  rubric,
  appliedRubricItemIds,
  onRubricChange,
  onRubricItemEdit,
  onAIFeedback,
  feedback,
  onFeedbackChange
}: RubricGradingProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>(appliedRubricItemIds)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [feedbackItemId, setFeedbackItemId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editPoints, setEditPoints] = useState(0) // Add editPoints state
  const [aiFeedback, setAIFeedback] = useState('')
  const [aiShouldApply, setAiShouldApply] = useState<'should' | 'should-not' | 'correct' | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setCheckedItems(appliedRubricItemIds)
  }, [appliedRubricItemIds])

  const handleCheckboxChange = (itemId: string) => {
    const updatedCheckedItems = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId]

    setCheckedItems(updatedCheckedItems)
    onRubricChange(updatedCheckedItems)
  }

  const handleAIFeedbackChange = (itemId: string, feedback: string, shouldApply: 'should' | 'should-not' | 'correct') => {
    onAIFeedback(itemId, feedback, shouldApply);
    setFeedbackItemId(null);
    setAIFeedback('');
    setAiShouldApply(null);
  };

  const handleEditStart = (item: IRubricItem) => {
    setEditingItemId(item.id);
    setEditDescription(item.description);
    setEditPoints(item.points); // Set initial points value
  };

  const handleEditSave = (item: IRubricItem) => {
    if (!editDescription) {
      toast({
        title: "Description cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Validate points input
    const newPoints = parseFloat(editPoints.toString()) // parseFloat handles potential string inputs
    if (isNaN(newPoints)) {
      toast({
        title: "Invalid points value",
        variant: "destructive",
      });
      return;
    }

    onRubricItemEdit(item.id, editDescription, newPoints);
    setEditingItemId(null);
  };

  const handleEditCancel = () => {
    setEditingItemId(null);
    setEditDescription('');
    setEditPoints(0); // Reset points value
  };


  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {rubric.map((item) => {
          const isChecked = checkedItems.includes(item.id)
          const isPositive = item.points >= 0
          const isEditing = editingItemId === item.id

          return (
            <div key={item.id}>
              <motion.div
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-md transition-colors",
                  isChecked && isPositive && "bg-green-100 dark:bg-green-900/30 border-2 border-green-500",
                  isChecked && !isPositive && "bg-red-100 dark:bg-red-900/30 border-2 border-red-500",
                  !isChecked && "bg-muted hover:bg-muted/80 dark:hover:bg-muted/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Checkbox
                  id={item.id}
                  checked={isChecked}
                  onCheckedChange={() => handleCheckboxChange(item.id)}
                  className="border-2"
                />
                {isEditing ? (
                  <div className="flex-grow flex items-center space-x-2">
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="flex-grow min-h-[2.5rem] resize-none dark:bg-black"
                      onFocus={(e) => {
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                      }}
                    />
                    <Input // Input for points
                      type="number"
                      value={editPoints}
                      onChange={(e) => setEditPoints(parseFloat(e.target.value))}
                      className="w-20 text-right dark:bg-black"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSave(item)}
                      className="hover:bg-slate-700 hover:text-accent-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditCancel}
                      className="hover:bg-slate-700 hover:text-accent-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Label htmlFor={item.id} className="flex-grow text-sm cursor-pointer">
                      {item.description}
                    </Label>
                    <span className={cn(
                      "font-semibold text-sm",
                      isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    )}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(item)}
                      className="hover:bg-slate-700 hover:text-accent-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFeedbackItemId(item.id)}
                      className="hover:bg-slate-700 hover:text-accent-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </motion.div>
              <AnimatePresence>
                {feedbackItemId === item.id && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-muted rounded-md mt-2"
                  >
                    <RadioGroup
                      value={aiShouldApply || undefined}
                      onValueChange={(value) => setAiShouldApply(value as 'should' | 'should-not' | 'correct')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="should" id="should-apply" />
                        <Label htmlFor="should-apply">AI should have applied this item but did not</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="should-not" id="should-not-apply" />
                        <Label htmlFor="should-not-apply">AI should not have applied this item but did</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="correct" id="correct-apply" />
                        <Label htmlFor="correct-apply">AI marked the correct answer</Label>
                      </div>
                    </RadioGroup>
                    <Textarea
                      value={aiFeedback}
                      onChange={(e) => setAIFeedback(e.target.value)}
                      placeholder="Explain why the AI made the wrong decision"
                      rows={3}
                      className="w-full resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => {
                        setFeedbackItemId(null);
                        setAIFeedback('');
                        setAiShouldApply(null);
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (aiShouldApply) {
                            handleAIFeedbackChange(item.id, aiFeedback, aiShouldApply);
                          } else {
                            toast({
                              title: "Error",
                              description: "Please select whether the AI should have applied this item.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!aiShouldApply}
                      >
                        Update Rubric
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback" className="text-xl font-semibold text-primary">Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Provide feedback to the student..."
          rows={6}
          className="w-full resize-none border-2 focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  )
}

