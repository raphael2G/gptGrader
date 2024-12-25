# Design Document: Single Question Feedback Screen

## Overview

This design focuses on creating a screen for evaluating a single question at a time. The layout prioritizes clarity and ease of navigation, allowing teachers to provide feedback and scoring efficiently. Each question will have a dedicated screen with navigation options to move between questions, and the interface will clearly separate the question and response from the rubric and feedback sections.

---

## Key Features

### 1. Navigation Between Questions
- **Dropdown Selector:**
  - At the top of the page, include a dropdown menu that lists all questions in the assignment.
  - Teachers can use this dropdown to quickly jump to any question.
- **Forward/Backward Arrows:**
  - Provide “Next” and “Previous” buttons to navigate sequentially through questions.
  - These buttons should be positioned near the dropdown or at the sides of the screen for intuitive access.

### 2. Question and Student Response
- **Location:**
  - Displayed on the **left side** of the screen.
- **Content:**
  - The top part shows the question text.
  - The student’s response is displayed below the question, with scrollable functionality if the response is long.
- **Styling:**
  - Use a clear distinction between the question (e.g., bold or boxed) and the student’s response.

### 3. Rubric and Feedback
- **Location:**
  - Displayed on the **right side** of the screen.
- **Rubric Section:**
  - Each rubric criterion is presented as:
    - **Checkbox:** Indicates whether the criterion was applied. Checked if applied, and unhighlighted if not.
    - **Description:** A short explanation of the criterion.
    - **Points Field:** Displays the points associated with the criterion, allowing for quick scoring.
  - Criteria that are checked should be highlighted for visibility.
- **Feedback Section:**
  - A large, scrollable text box for written feedback specific to the question.
  - Placeholder text such as “Enter feedback here...” should guide teachers.

### 4. General Layout
- **Left Side:**
  - Question and response content.
  - Takes approximately 60% of the screen width.
- **Right Side:**
  - Rubric and feedback panel.
  - Takes approximately 40% of the screen width.
  - Fixed position to avoid scrolling when switching questions.

---

## Implementation Steps

### Step 1: Page Structure and Navigation
1. **Create a new route or component** for the question evaluation screen.
2. **Navigation Elements:**
   - Add a dropdown at the top that lists all questions in the assignment. Populate it dynamically.
   - Implement “Next” and “Previous” buttons for sequential navigation.
   - Ensure the currently viewed question is reflected in the dropdown and updates appropriately.

### Step 2: Display Question and Response
1. Add a section on the left side of the screen for the question and the student’s response.
2. Style the question (e.g., bold or boxed).
3. Display the response below the question with scrollable functionality if needed.

### Step 3: Implement the Rubric
1. Add a section on the right side of the screen for the rubric:
   - Each criterion should include:
     - A **checkbox** to mark whether it was applied.
     - A **description** explaining the criterion.
     - A **points field** for the points awarded.
2. Highlight the criteria when their checkboxes are selected.

### Step 4: Add Feedback Section
1. Below the rubric, add a large text box for written feedback.
2. Include placeholder text to guide teachers on entering feedback.

### Step 5: Styling and Layout
1. Use a responsive design:
   - Ensure a 60-40 split between the left (question and response) and right (rubric and feedback).
   - Allow the rubric panel to remain fixed as the teacher scrolls through the response on the left.
2. Style buttons, dropdowns, and feedback fields for consistency with the rest of the application.

---

## Future Considerations
- **Autosave:** Implement autosaving for rubric selections and feedback to prevent data loss.
- **Keyboard Shortcuts:** Add shortcuts for navigation (e.g., arrow keys for moving between questions).
- **Rubric Customization:** Allow teachers to edit rubric criteria directly within the interface.
- **Student View Preview:** Provide an optional preview of how the feedback will look for the student.

---

## Expected Outcome
This design will create a streamlined, intuitive interface for evaluating single questions. The clear separation of question content, rubric scoring, and feedback ensures that teachers can work efficiently while maintaining focus on each aspect of the evaluation process.
