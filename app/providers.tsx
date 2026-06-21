'use client'

import { FireflySettingsProvider } from "@/components/firefly/FireflySettings"
import { QueryClient,QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PropsWithChildren,useState } from "react"

export function Providers({children}:PropsWithChildren){
    const [client]=useState(
        new QueryClient({
            defaultOptions:{
                queries:{
                    refetchOnWindowFocus:false
                }
            }
        })
    )

    return (
        <FireflySettingsProvider>
            <QueryClientProvider client={client}>
                {children}
                <ReactQueryDevtools initialIsOpen={false}/>
            </QueryClientProvider>
        </FireflySettingsProvider>
    )
}
