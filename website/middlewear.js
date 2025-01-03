import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'

const publicRoutes = ['/signin']

export async function middleware(request) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  try {
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    if (!token) {
      const url = new URL('/signin', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    try {
      await getAuth().verifyIdToken(token)
      return NextResponse.next()
    } catch (error) {
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete('token')
      return response
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}