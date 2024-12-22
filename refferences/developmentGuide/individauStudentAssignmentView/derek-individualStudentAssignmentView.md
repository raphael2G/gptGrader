Here, we want to create a dashboard which displays a students performance on a particular assignment.

This is accessed from the student view of the course performance side. Whenver an assignment is clicked, it will bring up a new page which will display this view. 

Here, we want to display the students response to each question, and the points the student earned (how they were graded on the rubric). 

There are going to be a bunch of ways to view this. You can make a drop down which will show one question at a time. You could also create a scrollable 
which will display all questions, and you just have to scroll. I feel like a scrollable makes sense. Now, the question is how should you display the rubric?
I think if it is scrollable, you could have a section for each question. The top part of the section will be the question, the bottom part will be the students response. the right half will be the rubric and the points they earned. of course, we also want there to be a feedback section. I do not know the best way of implementing the feedback and the rubric section. 

Okay, this is what I came up with:

1. display one question at a time on the screen. We need a drop down for each question so it is easy to go through them. We also need arrows to go forward and backwards between questions. 
2. The question and the students response will be on the left side of the screen. The right side of the screen will house the rubric, and the feedback. The rubric will be checkboxes, and will be highlighted if they were applied. 
3. The rubric will have it's description, the pts on the right. Beneath all of that will be feedback. 

I also want to add highlight annotations, which will highlight text justifying why a submission recieved a certain grade