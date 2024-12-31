# Guide: Converting Components to React Query

## Core Principles

1. **Minimize Props, Use IDs**
   - Instead of passing entire objects as props, pass IDs
   - Let React Query handle data fetching within the component
   - Example:
   ```typescript
   // Before
   interface AssignmentViewProps {
     assignment: IAssignment;
     submissions: ISubmission[];
     student: IUser;
   }

   // After
   interface AssignmentViewProps {
     assignmentId: string;
     studentId: string;
   }
   ```

2. **Replace State Management with Queries**
   - Convert loading states to use the react query hooks we have built
   - Replace error handling 
   - Use mutations for data updates
   ```typescript
   // Before
   const [assignment, setAssignment] = useState<IAssignment | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);

   // After
   const { 
     data: assignment,
     isLoading,
     error
   } = useGetAssignmentById(assignmentId);
   ```

3. **Handle Loading States**
   - Use React Query's `isLoading` and `isPending` states
   - Leverage our custom Button component's `isLoading` prop
   ```typescript
   // Loading state for queries
   if (isLoading) {
     return (
       <div className="flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }

   // Loading state for mutations
   <Button 
     onClick={handleSubmit}
     isLoading={isPending}
   >
     Submit
   </Button>
   ```

4. **Error Handling**
   - Use React Query's error states
   - Display errors using toast notifications
   ```typescript
   const router = useRouter()
   if (error || !data) {
    router.back()
    return null
  }
   ```

## Step-by-Step Conversion Process

### 1. Identify Data Dependencies
- List all data the component needs
- Convert prop dependencies to ID-based props
- Plan which queries will be needed

### 2. Set Up Queries
```typescript
// Create necessary queries
const {
  data: assignment,
  isLoading: assignmentLoading
} = useGetAssignmentById(assignmentId);

const {
  data: submissions,
  isLoading: submissionsLoading
} = useGetSubmissionsByAssignmentId(assignmentId);

// Combine loading states if needed
const isLoading = assignmentLoading || submissionsLoading;
```

### 3. Set Up Mutations
```typescript
const { 
  mutate: updateSubmission,
  isPending 
} = useUpdateSubmission();

const handleSubmit = () => {
  updateSubmission(
    { 
      id: submissionId,
      data: formData 
    },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Submission updated successfully"
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  );
};
```

### 4. Handle Loading and Error States
```typescript
// Early returns for loading/error states
if (isLoading) {
  return <LoadingSpinner />;
}

if (error || !data) {
  return <ErrorMessage error={error} />;
}
```

### 5. Clean Up Side Effects
- Remove unnecessary useEffects that were fetching data
- Keep useEffects that handle UI state or side effects unrelated to data fetching

## Best Practices

1. **Query Key Management**
   - Use consistent query keys
   - Structure keys hierarchically
   ```typescript
   queryKey: ['assignment', assignmentId, 'submissions']
   ```

2. **Enable/Disable Queries**
   - Use the `enabled` option to control when queries run
   ```typescript
   useQuery({
     enabled: !!userId,
     ...
   });
   ```





Remember:
- Keep components focused on UI logic
- Let React Query handle data fetching and caching
- Use built-in loading and error states
- Leverage the custom Button component for consistent loading states
- Use toast notifications for user feedback
- Keep query keys consistent and well-structured
- Consider optimistic updates for better UX


Example of what to lok like

```
How to organize the way the comonents look. comment what each thing is!
export default function ManageCoursesPage() {
  // standard stuff
  const user = UserAuth().user
  const { toast } = useToast()
  const router = useRouter()

  // hooks
  const {data: courses = [], isLoading, error} = useInstructingCourses(user?._id?.toString() || '', {enabled: !!user?._id?.toString()});
  const {mutate: createCourse, isPending: creatingCourse, error: errorCreatingCourse} = useCreateCourse();


  // States
  const [newCourse, setNewCourse] = useState({ title: '', courseCode: '', description: '', instructor: '' })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // hook wrappers
  const handleCreateCourse = async () => {
    if (newCourse.title && newCourse.courseCode) {
      createCourse(
        {courseData: newCourse, creatorId: user?._id.toString() || ''},
        {
          onSuccess: () => {
            setNewCourse({ title: '', courseCode: '', description: '', instructor: '' })
            setIsAddDialogOpen(false)
            toast({
              title: "Success",
              description: "Course added successfully.",
              variant: "success"
            })
          },

          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to add course. Please try again.",
              variant: "destructive",
            })
          }
        }
      )
    }
  }

  // component specific functions
  // - - NONE - - 

  // loading & error states
  if (isLoading) {return <div>Loading...</div>}
  if (errorCreatingCourse) {
    toast({
      title: "Something went wrong loading this course.",
      description: errorCreatingCourse?.message || "Please try again later",
      variant: "destructive"
    })
    router.push("/manage-courses")
    return <div>There was an issue getting your course. {errorCreatingCourse?.message}</div>;
  }
 
 // * rest of the component * 
 ```