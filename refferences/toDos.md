### This is ToDo list

1. Right now whenever a course code is already in use, the failure message just says failed to create course
really should say "course code already in use"

### After UI Merger

4. need to think a little more about how we want people to be able to grade it. shuold there be an option to just "calibrate" on the entire dataset? i feel like people would want that

7. Under calibration, we are choosing which dubmissions to show based on all submissions, not based on ungraded submissions. 

10. There are big issues with our draggable rubric item. The big issue is that you need an id to make them dragable, but our rubric items don't have ids when we first create them? so it is not exactly clear what to do. apparently you can use their array index as the ID. Also, there is some state management issues since the rubric item list creates a new state to manage it, but whenever that new state gets updated it doesnt update the original state. should probably just base everything off of the oriringal state and get rid of the new state


21. right now combined rubric and professor view of rubric are very very similar. should probably make them one component with flag for if professor or if student

27. Need to make some sort of UI for updating the rubric item text based on the feedback it just got

28. move the toast for submiting discrepancy reports (top right makes most sense)

29. Need to add "grading multiplier" for discrepancy reports. need to be able to mark if it was an "adequate effort" or not. Also the UI is not very clear right now. issues with the icons showing up. 

30. add a hover over each rubric item which explains who applied the rubric item and who did not

31. add question mark on combined rubric section which explains what the view shows you (student grading on left, staff grading on right. different rubric colors on each side show that...)

32. change url to give the course id
- make get course by courseId 

33. change url to give the assignment name
- make get assignment by courseId and assignment name

35. !!! need to work out the logic for determining if the self grading of an assignment is done or not
src/app/(dashboard)/courses/[courseId]/assignments/[assignmentId]/page.tsx
src/components/dashboard/courses/ProblemView.tsx



= = = = = =  next big changes = = == = =
36. set up protected routes with middleware
37. API varification with JWT

