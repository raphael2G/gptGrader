'use client';

import { notFound } from 'next/navigation';
import { BackButton } from '@/components/dashboard/BackButton';
import { AssignmentCard } from '@/components/dashboard/AssignmentCard';
import { UserAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { courseApi } from '@/api-client/endpoints/courses';
import { assignmentApi } from '@/api-client/endpoints/assignments';
import { ICourse } from '@/models/Course';
import { IAssignment } from '@/models/Assignment';

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loadedAssignments, setLoadeAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = UserAuth();

  useEffect(() => {
    if (!user) {
      redirect('/login');
    }
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch course
        const { data: courseData, error: courseError } = await courseApi.getCourseById(params.courseId);
        if (courseError) {
          setError(courseError.error);
          return;
        }
        if (!courseData) {
          setError('Course not found');
          return;
        }
        setCourse(courseData);

        // Fetch all assignments in parallel
        const assignmentPromises = courseData.assignments.map(id => 
          assignmentApi.getAssignmentById(id.toString())
        );
        
        const assignmentResults = await Promise.all(assignmentPromises);
        const assignmentsLoaded = assignmentResults
          .filter(result => result.data !== null)
          .map(result => result.data!) as IAssignment[];
          
        setLoadeAssignments(assignmentsLoaded);
        

      } catch (err) {
        setError('Failed to fetch course data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.courseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-xl text-muted-foreground">{course.description}</p>
        <p className="text-lg">Instructor: {course.instructor}</p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadedAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id?.toString()}
              courseId={course._id?.toString() || ''}
              id={assignment._id?.toString() || ''}
              title={assignment.title}
              dueDate={new Date(assignment.dueDate)}
              status={assignment.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}