import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { FireAuth } from '@/firebase/firebase'
import {useAuthState} from 'react-firebase-hooks/auth'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

  const [user] = useAuthState(FireAuth);
  console.log("this is running")

  if (user) {
    console.log(user);
    console.log("this is my user")
    return NextResponse.next()
  }
  return NextResponse.redirect(new URL('/login', request.url))
}
 
// See "Matching Paths" below to learn more
export const config = {
    matcher: '/',
  }
