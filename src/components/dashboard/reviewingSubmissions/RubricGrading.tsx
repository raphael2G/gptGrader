'use client'
import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, MessageSquare, X, Check } from 'lucide-react'
import { UserAuth } from '@/contexts/AuthContext'
import { 
  useGetAssignmentById, 
  useUpsertRubricItem 
} from '@/hooks/queries/useAssignments'
import { 
  useGetSubmissionsByAssignmentIdAndProblemId, 
  useUpdateSubmissionGrading 
} from '@/hooks/queries/useSubmissions'
import { IRubricItem } from '@/models/Assignment'
import { Types } from 'mongoose'
import debounce from 'lodash/debounce'
import { ISubmission } from '@/models/Submission'

interface RubricGradingParams {
  currentSubmission: ISubmission;
  allowRubricEdit?: boolean;
  allowAiFeedback?: boolean;

}

export function RubricGrading({currentSubmission, allowAiFeedback=false, allowRubricEdit=false}: RubricGradingParams) {
  // Get params and context
  const params = useParams()
  const { user } = UserAuth()
  const { toast } = useToast()
  
  // Parse URL params
  const assignmentId = params.assignmentId as string
  const problemId = params.problemId as string

  // Local UI state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [feedbackItemId, setFeedbackItemId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editPoints, setEditPoints] = useState(0)
  const [aiFeedback, setAIFeedback] = useState('')
  const [aiShouldApply, setAiShouldApply] = useState<'should' | 'should-not' | 'correct' | null>(null)

  // Queries
  const { data: assignment, isLoading: assignmentLoading } = useGetAssignmentById(assignmentId)

  // Get current problem and submission
  const problem = assignment?.problems.find(p => p._id?.toString() === problemId)

  const rubricItems = problem?.rubric.items || []

  // Mutations
  const { mutate: updateRubricItem } = useUpsertRubricItem()
  const { mutate: updateGrading } = useUpdateSubmissionGrading()

  // Event handlers
  const handleCheckboxChange = (itemId: string) => {
    toast({
      title: "Uh oh. You can't change these items by clicking!",
      description: "You can only change if a rubric item is applied or not by resolving a discrepancy report, or giving AI model feedback.",
      variant: "destructive" 
    })
    // if (!currentSubmission) return;

    // const currentItems = currentSubmission.appliedRubricItems?.map(id => id.toString()) || [];
    // const updatedItems = currentItems.includes(itemId)
    //   ? currentItems.filter(id => id !== itemId)
    //   : [...currentItems, itemId];
  
    // updateGrading(
    //   {
    //     submissionId: currentSubmission._id.toString(),
    //     gradingData: {
    //       gradedBy: user?._id?.toString() || '',
    //       appliedRubricItems: updatedItems,
    //       feedback: currentSubmission.feedback || ''
    //     }
    //   },
    //   {
    //     onError: (error) => {
    //       toast({
    //         title: "Error",
    //         description: error.message || "Failed to update grading",
    //         variant: "destructive"
    //       });
    //     }
    //   }
    // );
  };

  const handleFeedbackChange = useCallback(
    debounce((newFeedback: string) => {
      if (!currentSubmission) return;

      updateGrading(
        {
          submissionId: currentSubmission._id.toString(),
          gradingData: {
            gradedBy: user?._id?.toString() || '',
            appliedRubricItems: currentSubmission.appliedRubricItems?.map(id => id.toString()) || [],
            feedback: newFeedback
          }
        },
        {
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update feedback",
              variant: "destructive"
            });
          }
        }
      );
    }, 500),
    [currentSubmission, updateGrading, user?._id]
  );

  // const handleAIFeedbackChange = (itemId: string, feedback: string, shouldApply: 'should' | 'should-not' | 'correct') => {
    // setFeedbackItemId(null);
    // setAIFeedback('');
    // setAiShouldApply(null);
  //   toast({
  //     title: "Succesfully noted this down.",
  //     description: "Actually we did not do anything."
  //   })
  // };

  const handleAIFeedbackChange = (itemId: string) => {


    const isCurrentlySelected = currentSubmission.appliedRubricItems?.some(
      (appliedId) => appliedId.toString() === itemId
    );
  
    const updatedItems = isCurrentlySelected
      ? currentSubmission.appliedRubricItems?.map(id=>id.toString()).filter((id) => id.toString() !== itemId) || []
      : [...(currentSubmission?.appliedRubricItems?.map(id => id.toString()) || []), itemId];
  
    updateGrading(
      {
        submissionId: currentSubmission._id.toString(),
        gradingData: {
          gradedBy: user?._id?.toString() || '',
          appliedRubricItems: updatedItems,
          feedback: currentSubmission.feedback || '',
        },
      },
      {
        onSuccess: () => {
          setFeedbackItemId(null);
          setAiShouldApply(null);
          setAIFeedback('');
          toast({
            title: 'AI Feedback Submitted. Please update the rubric to avoid this error in the future.',
            description: 'Rubric item selection updated based on feedback.',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to update rubric item selection.',
            variant: 'destructive',
          });
        },
      }
    );


    setFeedbackItemId(null);
    setAIFeedback('');
    setAiShouldApply(null);
  };
  

  const handleEditStart = (item: IRubricItem) => {
    setEditingItemId(item._id?.toString() || null)
    setEditDescription(item.description)
    setEditPoints(item.points)
  }

  const handleEditSave = (itemId: string) => {
    if (!editDescription) {
      toast({
        title: "Description cannot be empty",
        variant: "destructive",
      })
      return
    }

    const newPoints = parseFloat(editPoints.toString())
    if (isNaN(newPoints)) {
      toast({
        title: "Invalid points value",
        variant: "destructive",
      })
      return
    }

    updateRubricItem(
      {
        assignmentId,
        problemId,
        rubricItemData: {
          _id: new Types.ObjectId(itemId),
          description: editDescription,
          points: newPoints
        }
      },
      {
        onSuccess: () => {
          setEditingItemId(null)
          toast({
            title: "Success",
            description: "Rubric item updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          })
        }
      }
    )
  }

  // Loading state
  if (assignmentLoading || !problem) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {rubricItems.map((item) => {
          const itemId = item._id?.toString() || '';
          const isChecked = currentSubmission?.appliedRubricItems?.some(
            appliedId => appliedId.toString() === itemId
          ) || false;
          const isPositive = item.points >= 0;
          const isEditing = editingItemId === itemId;

          return (
            <div key={itemId}>
              <motion.div
                className={cn(
                  "flex items-center space-x-3 p-2 m-2 rounded-md transition-colors",
                  isChecked && isPositive && "bg-green-100 dark:bg-green-900/30 border-2 border-green-500",
                  isChecked && !isPositive && "bg-red-100 dark:bg-red-900/30 border-2 border-red-500",
                  !isChecked && "bg-muted hover:bg-muted/80 dark:hover:bg-muted/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >

                <div className="flex flex-col items-center gap-1 p-1">
                  <span className={cn(
                        "font-semibold text-xs p-0 m-0",
                        isPositive ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                      )}>
                        {item.points > 0 ? '+' : ''}{item.points.toFixed(1)}
                      </span>
                  <Checkbox
                    id={itemId}
                    checked={isChecked}
                    onCheckedChange={() => handleCheckboxChange(itemId)}
                    className="border-2 justify-between"
                  />
                </div>
                
                    
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
                    <Input
                      type="number"
                      value={editPoints}
                      onChange={(e) => setEditPoints(parseFloat(e.target.value))}
                      className="w-20 text-right dark:bg-black"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSave(itemId)}
                      className="hover:bg-slate-700 hover:text-accent-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingItemId(null)}
                      className="hover:bg-slate-700 hover:text-accent-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Label 
                      htmlFor={itemId}
                      className="flex-grow text-xs cursor-pointer"
                    >
                      {item.description}
                    </Label>

                    

                      <div className="flex-col">
                        { allowRubricEdit &&
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditStart(item)}
                          className="hover:bg-slate-700 hover:text-accent-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>}

                        { allowAiFeedback &&
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFeedbackItemId(itemId)}
                          className="hover:bg-slate-700 hover:text-accent-foreground"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>}

                        
                      </div>
                    
                    
                  </>
                )}
              </motion.div>
              <AnimatePresence>
                {feedbackItemId === item._id.toString() && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-muted rounded-md mt-2"
                  >
                    <RadioGroup
                      value={aiShouldApply || undefined}
                      onValueChange={(value) => setAiShouldApply(value as 'should' | 'should-not')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="should" id="ai-feedback-should" />
                        <Label htmlFor="ai-feedback-should">
                          {isChecked
                            ? 'AI should not have selected this item but did'
                            : 'AI should have selected this item but did not'}
                        </Label>
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
                          if (aiShouldApply && !!aiFeedback) {
                            handleAIFeedbackChange(item._id.toString());
                          } else {
                            toast({
                              title: "Error",
                              description: "Please select whether the AI should have applied this item.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!aiShouldApply || !aiFeedback}
                      >
                        Update Rubric
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback" className="text-xl font-semibold text-primary">
          Feedback
        </Label>
        <Textarea
          id="feedback"
          value={currentSubmission?.feedback || ''}
          onChange={(e) => handleFeedbackChange(e.target.value)}
          placeholder="Provide feedback to the student..."
          rows={6}
          className="w-full height-auto border-2 focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}