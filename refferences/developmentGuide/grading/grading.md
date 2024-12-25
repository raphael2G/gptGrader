# Grading

This is going to be a little bit of a tricky thing to build out. It is not exactly clear what we want. 


# vision
This is the following approach I am envisioning: 
1. Rubric generation - an objective rubric is created which has items and point values. 
2. Grading - each submission is applied rubric items and feedback

We want to enable this workflow in our project. Lets try to come up with what that workflow will look like. 

1. A professor decides they want to start grading assignments. They go onto their course, and click grading. Here, all of their ungraded assignments show up. They can select which one they want to go about grading.
2. Now, the professor is at the first point in the process of grading assignments. Notice that for every problem, the first step is to come up with a rubric, and the second step is to go about grading the assignments. lets come up with some visually appealing way to display these steps. How about there is a row for every single question of a problem. Then, each problem will indicate if it has a finalized rubric or not (initially they will all be no). Once a problem does have a rubric, there will then be a slider for what percentage of them are graded.
3. Suppose the professor clicks on a question that does not yet have a rubric finalized yet. We must give them the tools to create, modify, and finalize a rubric. 
4. Suppose the professor clicks on a question that does have a finalized rubric. We must bring them student responses, and allow them to quickly and easily apply grades to them. I envision the question at the top, the students response at the bottom. On the right side of the screen is the rubric, which is all initially unchecked. the grader can check these boxes as they see fit. There is a next and previous button which will bring them to the next or previous student submission for a given problem, ordered by the time the submissions were turned in.
5. There should also be a view to see how every submission has been graded for a certain problem. Maybe this is what the grader is brought to whenever they start to grade, and once they click somewhere to start, then they can have the next and previous options.