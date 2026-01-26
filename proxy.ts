import { NextRequest, NextResponse } from "next/server";
import { EnumTokens } from "./lib/services/auth-token.service";
import { DASHBOARD_PAGES } from "./lib/config/pages-url.config";


export function proxy(
    request:NextRequest,
){
    const {url , cookies} = request
    
    const refreshToken = cookies.get(EnumTokens.REFRESH_TOKEN)?.value

    const isAuthPage = url.includes('/auth')

    if(isAuthPage && refreshToken){
        return NextResponse.redirect(new URL(DASHBOARD_PAGES.HOME,url))
    }

    if(isAuthPage){
        return NextResponse.next()
    }

    if(!refreshToken){
        return NextResponse.redirect(new URL('/auth',request.url))
    }

    return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
}


