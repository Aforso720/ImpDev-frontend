"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"
import { toast } from "sonner"

export function InviteLinkDialog({
  inviteUrl,
  trigger,
}: {
  inviteUrl: string
  trigger: React.ReactNode
}) {
  const onCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    toast.success("Ссылка приглашения скопирована")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ссылка приглашения</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input value={inviteUrl} readOnly className="border-[#344966]" />
          <Button type="button" variant="outline" size="icon" onClick={onCopy} title="Скопировать">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Открой ссылку или отправь её человеку — по ней можно присоединиться к университету.
        </p>
      </DialogContent>
    </Dialog>
  )
}
