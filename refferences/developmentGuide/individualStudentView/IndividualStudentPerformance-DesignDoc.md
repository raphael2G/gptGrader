# Student Performance Dashboard Design Document

## Overview

This document outlines the design and implementation plan for a dedicated “Student Performance Dashboard” page. When a teacher clicks on a specific student, they will be navigated to a new screen that provides both a textual and visual summary of the student’s performance across all course assignments.

The initial iteration of this dashboard will present:

1. A vertical list of all assignments on the left side, showing the student’s earned points and the total points possible.
2. A visual representation of the student’s assignment scores in the main content area on the right. Initially, this will be an empty plot area, which we will iterate into a scatter plot (or histogram) where the x-axis represents assignments and the y-axis represents the student’s percentage score.

This incremental approach ensures a clear roadmap from basic page navigation to a data-rich, interactive visualization.

---

## Step-by-Step Implementation

### Step 1: New Student Performance Page

**Objective:**  
When the teacher clicks on a student’s name from the course’s roster page, the system should navigate to a new “Student Performance Dashboard” page dedicated to that student.

**Tasks:**
- **Routing Setup:**  
  - Create a new route (e.g., `/courses/:courseId/students/:studentId/performance`) that loads the performance dashboard component.
- **Dashboard Component Initialization:**  
  - Implement a `StudentPerformanceDashboard` React/Vue/etc. component that serves as the container.
  - On load, fetch the necessary student and course data (e.g., student’s name, course title).
- **Page Layout Skeleton:**  
  - Divide the page into two main sections: a left column (sidebar-like) and a large right column for data visualization.
  - Initially, the left column can remain empty or display a “Loading…” message until data is fetched.
  - The right column will be a placeholder area where the visualization will eventually live.

**Expected Outcome:**  
A navigable page that uniquely belongs to the selected student. Teachers can now move from a course’s roster page to a detailed performance dashboard for any student.

---

### Step 2: Assignment List on the Left Column

**Objective:**  
Display a vertical list of all assignments in the course with each assignment’s earned points and total points.

**Tasks:**
- **Data Fetching:**
  - Use an API client function like `getAssignmentsForCourse(courseId)` and `getSubmissionsForStudentInCourse(studentId, courseId)` (or placeholders if not yet implemented).
  - Merge these data sets: For each assignment, determine how many points the student earned (from their submission) versus the total available.
- **Rendering the List:**
  - In the left column, render a scrollable list of assignments.
  - Each list item should display:
    - **Assignment Title**
    - **Score Info:**  
      Format as `earnedPoints/totalPoints`. For example: `15/20`.
  - Consider adding a subtle visual indicator (e.g., a colored dot) next to each assignment if the student submitted it late or not at all (this can be a later enhancement).
- **Styling & Layout:**
  - The left column should be fixed-width and possibly scrollable if there are many assignments.
  - Ensure text is readable and space is used efficiently.

**Expected Outcome:**  
The left side of the dashboard now provides a quick textual reference of how the student performed on each assignment (points out of total).

---

### Step 3: Empty Scatter Plot or Histogram on the Right

**Objective:**  
Set up the initial placeholder for the data visualization area on the right side. At this stage, it will not contain data-driven points—just a blank chart area.

**Tasks:**
- **Charting Library Setup:**
  - Choose a charting library (e.g., Chart.js, D3.js, Recharts, etc.) and integrate it into the project.
  - Create a chart component (e.g., `StudentPerformanceChart`) that can be fed data later.
- **Empty Chart Rendering:**
  - Render an empty chart container on the right side of the layout.
  - Include basic axes or labels (even if they’re just placeholders).
  - Ensure the chart area is responsive and adjusts to different screen sizes.
  
**Expected Outcome:**  
The right column now displays a chart placeholder, signaling where the graphical representation of performance will go in the next step.

---

### Step 4: Plotting Assignments vs. Percentage

**Objective:**  
Populate the previously empty chart with data points representing the student’s score on each assignment as a percentage. The x-axis will correspond to individual assignments, and the y-axis will represent the percentage score the student achieved.

**Tasks:**
- **Data Preparation:**
  - From the assignment and submission data, calculate the percentage for each assignment:
    \[
    \text{percentage} = \frac{\text{earnedPoints}}{\text{totalPoints}} \times 100\%
    \]
  - Assign a logical ordering to assignments for the x-axis (e.g., by due date or assignment ID).
  - Create an array of data objects like:  
    ```json
    [
      { x: "Assignment 1", y: 75 },
      { x: "Assignment 2", y: 90 },
      ...
    ]
    ```
- **Chart Configuration:**
  - In the `StudentPerformanceChart` component, map each assignment’s percentage to a scatter plot point.
  - X-Axis: Labeled by assignment index or a short name. Consider a short label like `1`, `2`, `3` and then use tooltips to show full titles.
  - Y-Axis: Shows the percentage (0% to 100%).
  - Add hover tooltips for each data point to reveal the assignment’s full title and exact score.
- **Interaction Enhancements (Optional, Future):**
  - When hovering over a data point on the chart, highlight the corresponding assignment row on the left column.
  - Allow sorting or filtering if the number of assignments is large (can be done after initial implementation).

**Expected Outcome:**  
The right side chart now displays a scatter plot with each point representing the student’s performance on a given assignment. Teachers can visually identify patterns in the student’s scores and compare them across assignments.

---

## Future Enhancements (Not in Current Scope)

- **Trend/Reference Lines:**  
  Add a horizontal line showing the average score for quick context.
- **Color Coding Points:**  
  Differentiate on-time vs. late submissions by point color.
- **Interactivity:**  
  Clicking a point on the chart could expand a detail panel with submission specifics, teacher feedback, or attached files.

---

## Conclusion

Following this step-by-step plan, we will build a Student Performance Dashboard that provides both a textual reference (list of assignments and scores) and a visual representation (scatter plot of percentages). This approach allows us to start simple—just navigation and placeholders—and then incrementally add data, visuals, and interactivity, resulting in a rich and informative teacher-facing feature.
