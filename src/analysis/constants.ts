import { Types } from "mongoose";


export const AI_GRADER_ID = new Types.ObjectId('696969696969420696969420');


/**
 * Utility type that verifies exact type equality.
 * Returns T if types match exactly, never if they don't.
 */
export type VerifyExact<T1, T2> = [T1] extends [T2] ? [T2] extends [T1] ? T1 : never : never;
