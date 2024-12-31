### This is ToDo list

1. Right now whenever a course code is already in use, the failure message just says failed to create course
really should say "course code already in use"


2. Need more confirmation before deleting a course


s

### After UI Merger



3. Rubric is the same as the calibration rubric (should not be editable and should not be able to give model feedback) (or maybe we do? need to think about this)
/manage-courses/course1/grading/assignment1/problem1/graded/38zc4px1wbz


4. need to think a little more about how we want people to be able to grade it. shuold there be an option to just "calibrate" on the entire dataset? i feel like people would want that


6. Under calibration, the amount that we are calibrating is stored as a parameter in the URL. this is probably not a good idea. would rather not have this exposed to the user. 

7. Under calibration, we are choosing which dubmissions to show based on all submissions, not based on ungraded submissions. 

8. We have a grade all submissions button, but maybe should we have a grade submissions with AI assistance? where the human goes through and does it with the AI? or is that just calibration? Maybe we do not want too much calibration

9. in our viewing of studnets grades on a problem basis, we are fetching submissions for the entire assignment, not just that problem
http://localhost:3000/manage-courses/course1/grading/assignment1/problem1/graded/vr9u1brcove

10. There are big issues with our draggable rubric item. The big issue is that you need an id to make them dragable, but our rubric items don't have ids when we first create them? so it is not exactly clear what to do. apparently you can use their array index as the ID. Also, there is some state management issues since the rubric item list creates a new state to manage it, but whenever that new state gets updated it doesnt update the original state. should probably just base everything off of the oriringal state and get rid of the new state

11. The back button just does router.back() in a lot of places. this works sometimes, but if there are multiple ways to get there then it does not work as expecte



13. For a lot of the graphs, the text color needs to change when in dark mode on the tool tip

14. When we are "grading all submissions" with AI, we should probably make a big pop up which doesn't allow the user to click anything on the screen. 
manage-courses/course1/grading/assignment1/problem2/setup




21. right now combined rubric and professor view of rubric are very very similar. should probably make them one component with flag for if professor or if student


26. rubric in the calibration section is unclickeable. that way only the AI can grade it, and then to change it you have to give feedback for why

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

36. !!! with users, we need to create a user in mongodb if they do not have firebase id... i am not sure how this is not done, must of got overwritten at some point.