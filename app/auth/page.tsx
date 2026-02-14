import type {Metadata} from 'next'

import { NO_INDEX_PAGE } from '@/lib/constants/seo.constants'
import { LoginForm } from "@/components/login-form"

export const metadata : Metadata = {
    title:'Auth',
    ...NO_INDEX_PAGE
}

export default function AuthPage(){
    return(
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
            <LoginForm/>
        </div>
    </div>
    );
};