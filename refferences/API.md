# API Routes Documentation

This documentation outlines the file structure for a Next.js API that handles course management functionality. The API is organized using Next.js route handlers, following RESTful conventions.

# Client APIs

below is not a file tree. it just stores all of the functions in the api
```
api-client/
└── users/
│   └── create
│   └── getEnrolledCourses  
│   └── getInstructingCourses
│
└── courses/
│   └── getCourseById
│   └── createCourse
│   └── delete
│   └── addStudent
│   └── joinCourseByCode
│ 
└── assignments/
│   └── getAssignmentById
│   └── create
│   └── update
│   └── delete
│   └── upsertProblem
│   └── deleteProblem
│   └── upsertRubricItem
│   └── deleteRubricItem
│
└── submissions/
    └── (no functions implemented yet)
```

## File Structure
Notice that we have two folders. One stores the actual API routes, while the other stores client function to interact with them, abstracting annoying implementation details.
```
src/
└── api-client/
│   ├── base.ts              # Axios instance + basic setup
│   └── endpoints/
│       ├── users.ts         # User API endpoints
│       ├── courses.ts       # Course API endpoints
│       ├── assignments.ts   # Assignment API endpoints
│       └── submissions.ts   # Submission API endpoints
│
└── app/
    └── api/                 # Server-side API routes
        ├── users/
        ├── courses/
        ├── assignments/
        └── submissions/

```

### Why organize this way?
This leads to much cleaner code. 

##### With API Client
With the API client, simply call the function with the data:

```
import { courseApi } from '@/api-client';

// Clean, simple function call
const { data, error } = await courseApi.create({
  title: "Introduction to Computer Science",
  courseCode: "CS101",
  description: "Learn CS fundamentals",
  instructor: "Dr. Smith"
});
```

##### Without Wrapper
Without the API client, you'd need to handle all of this manually

```
const createCourse = async (courseData) => {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create course');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```



### User Management
```
    ├── users/                        # User endpoints
    │   ├── route.ts                  # Create new users
    │   ├── [userId]/                 # User-specific operations
    │   │   └── route.ts              # Get user details
    │   └── [userId]/courses/         # User's course relationships
    │       └── route.ts              # Get courses (as student/instructor)
```

### Course Management
```
    ├── courses/                      # Course endpoints
    │   ├── route.ts                  # List/create courses
    │   └── [courseId]/              # Course-specific operations
    │       ├── route.ts              # Get/update course details
    │       ├── students/            # Student enrollment
    │       │   ├── route.ts          # Add students
    │       │   └── [studentId]/      # Student-specific operations
    │       │       └── route.ts      # Remove student
    │       ├── instructors/         # Instructor management
    │       │   ├── route.ts          # Add instructors
    │       │   └── [instructorId]/   # Instructor-specific operations
    │       │       └── route.ts      # Remove instructor
    │       └── assignments/         # Course assignments
    │           └── route.ts          # List course assignments
```

### Assignment Management
```
    ├── assignments/                  # Assignment endpoints
    │   ├── route.ts                  # Create assignments
    │   └── [assignmentId]/          # Assignment-specific operations
    │       ├── route.ts              # Get/update/delete assignment
    │       ├── problems/            # Problem management
    │       │   ├── route.ts          # Add/update problems
    │       │   └── [problemId]/      # Problem-specific operations
    │       │       └── route.ts      # Delete problem
    │       └── rubric-items/        # Rubric management
    │           ├── route.ts          # Add/update rubric items
    │           └── [itemId]/         # Rubric item operations
    │               └── route.ts      # Delete rubric item

app/api/assignments/
├── route.ts                          # POST: createAssignment
├── [assignmentId]/
│   ├── route.ts                      # PATCH: updateAssignment
│   │                                 # DELETE: deleteAssignment
│   ├── problems/
│   │   ├── route.ts                  # POST: upsertProblem
│   │   └── [problemId]/
│   │       └── route.ts              # DELETE: deleteProblem
│   └── rubric-items/
│       ├── route.ts                  # POST: upsertRubricItem
│       └── [itemId]/
│           └── route.ts              # DELETE: deleteRubricItem
```

### Submission Management
```
app/api/submissions/
├── route.ts                          # POST: upsertSubmission
├── [submissionId]/
│   ├── route.ts                      # GET: getSubmissionById
│   │                                 # PATCH: updateSubmission
│   └── grade/
│       └── route.ts                  # PATCH: updateGrading
│   └── self-grade/
│       └── route.ts                  # PATCH: updateSelfGrading
├── student/
│   └── [studentId]/
│       └── route.ts                  # GET: getSubmissionsByStudent
├── assignment/
│   └── [assignmentId]/
│       └── route.ts                  # GET: getSubmissionsByAssignment
└── problem/
    └── [problemId]/
        └── route.ts                  # GET: getSubmissionsByProblem
```

Each `route.ts` file contains handlers for HTTP methods (GET, POST, PATCH, DELETE) appropriate for that endpoint. The handlers validate requests, authenticate users, call the corresponding service functions, and return formatted responses.


