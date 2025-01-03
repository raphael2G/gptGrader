// app/api/analyze/submissions/grade/[assignmentId]/[problemId]/route.ts
import { NextResponse } from 'next/server';
import { gradeAllSubmissions } from '@/analysis/LLMs/GPT/grading/services/bulkGradeSubmissions';
import { Types } from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string; problemId: string } }
) {
  try {
    // Create EventStream response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start the response
    const response = new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Start grading process
    gradeAllSubmissions(
      new Types.ObjectId(params.assignmentId),
      new Types.ObjectId(params.problemId),
      3, // Concurrent operations
      async (progress) => {
        try {
          // Send progress update
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
          );
        } catch (error) {
          console.error('Error writing progress:', error);
        }
      }
    )
    .then(async (finalProgress) => {
      // Send completion message
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ ...finalProgress, complete: true })}\n\n`)
      );
      await writer.close();
    })
    .catch(async (error) => {
      // Send error message
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
      );
      await writer.close();
    });

    return response;
  } catch (error) {
    console.error('Error in grade submissions route:', error);
    return NextResponse.json(
      { error: 'Failed to start grading process' },
      { status: 500 }
    );
  }
}