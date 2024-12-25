# Students Feature Design Document

## Overview

The “Students” section of the course management area is designed to provide instructors with an at-a-glance roster of all the students enrolled in their course, along with the ability to drill down into individual student performance details. The primary goals of this feature are:

- **High-level View:** Display all enrolled students with essential identifying information and simple metrics.
- **Drill-down View:** On selecting an individual student, show a detailed, per-assignment performance overview.

This component will integrate seamlessly with the existing navigation options on the teacher’s side of the system—where they have three main sections: **Assignments**, **Students**, and **Grading**. This document focuses solely on the **Students** feature.

---

## User Flow & Interaction

### 1. Entry Point: The Students Section
- The teacher navigates to the course management page (for a specific course).
- On this page, three primary actions are available: **Assignments**, **Students**, and **Grading**.
- When the teacher clicks **“Students”**, they are taken to the **Students Roster Page**.

### 2. Viewing All Students
- On the **Students Roster Page**, the teacher sees a table listing all enrolled students.
- Each row includes:
  - **Student Name**
  - **Student Email**
  - (Optional) Additional fields if easily available, such as last login date or number of submissions.
- The roster may be sortable by various attributes (e.g., name, email).

### 3. Viewing an Individual Student
- Clicking a student’s name (or a “View Details” button in that row) navigates to the **Individual Student Performance Page**.
- This page displays the selected student’s performance across all assignments in the course:
  - **Assignment Name**
  - **Submission Status**: On-time, Late, or Not Submitted
  - **Grade/Score**: e.g., `18/20 points`
- Information is presented in a table, one row per assignment.

### 4. Returning to the Roster
- A “Back” button or breadcrumb navigation allows the teacher to return to the **Students Roster Page** from the individual student’s page.

---

## Data Requirements & Models

### Data Sources

**Students Roster View:**
- Requires a list of all enrolled students for a given `courseId`.
- Basic fields:
  - `Student.id`
  - `Student.name`
  - `Student.email`
- Optional fields (if easily available):
  - `Student.lastLoginDate` or `createdAt`
  - `Student.numSubmissions` (aggregate)

**Individual Student View:**
- Given a `studentId` and `courseId`, we need:
  - List of **assignments** for the course:
    - `Assignment.id`
    - `Assignment.title`
    - `Assignment.dueDate`
    - `Assignment.totalPoints`
  - **Submissions** by the student:
    - `Submission.id`
    - `Submission.assignmentId`
    - `Submission.submittedAt`
    - `Submission.score`

### Computed Values

**Submission Status:**
- **On-time:** `submittedAt <= dueDate`
- **Late:** `submittedAt > dueDate`
- **Not Submitted:** No submission record for that assignment

These computations can be performed client-side after fetching the data.

---

## API Requirements & Clients

**Roster Page Data:**
- An API client call such as `getStudentsInCourse(courseId: string) -> Student[]`.
- If this does not exist, we will:
  - Add a `// TODO: Implement getStudentsInCourse()` comment.
  - Use mock data during development.

**Individual Student Data:**
- API client calls:
  1. `getAssignmentsForCourse(courseId: string) -> Assignment[]`
  2. `getSubmissionsForStudentInCourse(studentId: string, courseId: string) -> Submission[]`

If these do not exist, we note placeholders:
- `// TODO: Implement getAssignmentsForCourse()`
- `// TODO: Implement getSubmissionsForStudentInCourse()`

---

## UI/UX Design Considerations

**Styling:**
- Match existing course management styling.
- Tables should be responsive and easy to read.
- Consider pagination for large lists of students.

**Navigation:**
- **Students Roster Page:**
  - Title: “Students”
  - Table listing all students.
- **Individual Student Performance Page:**
  - Title: “[Student Name] - Performance”
  - Table listing each assignment, its due date, status, and score.
- Provide a “Back” link or breadcrumb navigation.

**Accessibility:**
- Ensure keyboard navigability and proper ARIA labels.
- Maintain high contrast and readable font sizes.

---

## Development Steps

1. **Backend/Client Preparation:**
   - Confirm or create `getStudentsInCourse(courseId)`.
   - Confirm or create `getAssignmentsForCourse(courseId)`.
   - Confirm or create `getSubmissionsForStudentInCourse(studentId, courseId)`.
   - Use placeholders if these do not exist.

2. **Frontend Integration (Roster Page):**
   - Add a “Students” link in the teacher’s course navigation.
   - Fetch and display the student list.

3. **Frontend Integration (Individual Student Page):**
   - On student selection, fetch assignments and submissions.
   - Compute submission status and display the results in a table.

4. **Testing & Validation:**
   - Validate data correctness.
   - Ensure responsiveness and usability.

5. **Polish & Iteration:**
   - Add tooltips, filtering, sorting as needed.
   - Consider pagination and performance optimizations.

---

## Future Considerations

- **Bulk Actions:** Message all students or export the roster.
- **Advanced Analytics:** Summary statistics, late submission counts, average scores.
- **Integration with Grading:** Direct grading options from the student performance page.

---

**Conclusion:**
This document outlines the requirements, data handling, UI structure, and integration strategies for the Students feature in the teacher’s course management interface. With this plan in place, the development team can proceed confidently to implement a clear, maintainable, and user-friendly solution.
