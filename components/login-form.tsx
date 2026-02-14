"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IAuthForm, IErrRequest } from "@/lib/types"
import { DASHBOARD_PAGES } from "@/lib/config/pages-url.config"
import { authService } from "@/lib/services/auth.service"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { AxiosError } from "axios"

export function LoginForm({ className, ...props }:  React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<IAuthForm>({
    mode: "onChange",
  })

  const [isLoginForm, setIsLoginForm] = useState(true)


  React.useEffect(()=>{
    reset()
  },[isLoginForm])

  const { push } = useRouter()

  function getServerMessage(err: AxiosError<IErrRequest>): string {
  const msg = err?.response?.data.message
  if(msg === "Invalid password") return "Неверный email или пароль"
  if(msg === "User already exists") return "Этот email уже занят"
  if(msg === "User not found") return "Такой пользователь не найден"
  return "Произошла ошибка. Попробуйте ещё раз."
  }

  function mapToRu(message: string): string {
    const m = message.toLowerCase()
    if (m.includes("invalid password")) return "Неверный пароль"
    if (m.includes("unauthorized")) return "Не удалось авторизоваться"
    if (m.includes("not found")) return "Пользователь не найден"
    if (m.includes("already") || m.includes("exists")) return "Пользователь с таким email уже существует"
    return message
  }

  const { mutate, isPending } = useMutation({
    mutationKey: ["auth"],
    mutationFn: (data: IAuthForm) => {
      if (isLoginForm) {
        return authService.main("login", {
          email: data.email,
          passwordHash: data.passwordHash,
        })
      }

      const name = typeof data.name === "string" ? data.name.trim() : data.name
      const payload = {
        email: data.email,
        passwordHash: data.passwordHash,
        name: name
      }

      return authService.main("register", payload)
    },
    onSuccess() {
      toast.success(isLoginForm ? "Вы успешно вошли" : "Аккаунт создан")
      reset()
      push(DASHBOARD_PAGES.HOME)
    },
    onError(err: AxiosError<IErrRequest>) {
      const raw = getServerMessage(err)
      const msg = mapToRu(raw)

      if (raw === "Invalid password") {
        setError("passwordHash", { type: "server", message: "Неверный пароль" })
      } else {
        setError("root", { type: "server", message: msg })
      }

      // toast.error(msg)
    },
  })

  const onSubmitHand: SubmitHandler<IAuthForm> = (data) => {
    clearErrors()
    mutate(data)
  }

  const emailError = errors?.email?.message
  const passError = errors?.passwordHash?.message
  const passConfError = errors?.confirmPassword?.message
  const rootError = errors?.root?.message

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 transition-all duration-300 ease-out">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmitHand)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{isLoginForm ? "Вход" : "Регистрация"}</h1>
                <p className="text-muted-foreground text-balance">
                  {isLoginForm
                    ? "Войдите в аккаунт, чтобы продолжить"
                    : "Создайте аккаунт, чтобы начать обучение"}
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  disabled={isPending}
                  {...register("email", {
                    required: "Введите email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Некорректный email",
                    },
                  })}
                  className={cn(emailError && "border-destructive focus-visible:ring-destructive/50")}
                />
                {emailError ? (
                  <FieldDescription className="text-destructive">{String(emailError)}</FieldDescription>
                ) : null}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                  {/* <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline text-muted-foreground"
                  >
                    Забыли пароль?
                  </a> */}
                </div>

                <Input
                  id="password"
                  type="password"
                  disabled={isPending}
                  {...register("passwordHash", {
                    required: "Введите пароль",
                    minLength: { value: 6, message: "Пароль должен быть не короче 6 символов" },
                  })}
                  className={cn(passError && "border-destructive focus-visible:ring-destructive/50")}
                />
                {passError ? (
                  <FieldDescription className="text-destructive">{String(passError)}</FieldDescription>
                ) : null}
              </Field>


              {!isLoginForm && <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Подтвердите пароль</FieldLabel>
                </div>

                <Input
                  id="password"
                  type="password"
                  disabled={isPending}
                  {...register("confirmPassword", {
                    required: "Подтвердите пароль",
                     validate: (value) => {
                      const { passwordHash } = getValues(); 
                      return value === passwordHash || "Пароли не совпадают"; 
                    }
                  })}
                  className={cn(passConfError && "border-destructive focus-visible:ring-destructive/50")}
                />
                {passConfError ? (
                  <FieldDescription className="text-destructive">{String(passConfError)}</FieldDescription>
                ) : null}
              </Field>}

              {/* name только в регистрации */}
              {!isLoginForm ? (
                <Field>
                  <FieldLabel htmlFor="name">Имя*</FieldLabel>
                  <Input id="name" type="text" disabled={isPending} {...register("name")} />
                </Field>
              ) : null}


              {rootError ? (
                <FieldDescription className="text-destructive text-center">
                  {String(rootError)}
                </FieldDescription>
              ) : null}

              <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (isLoginForm ? "Входим…" : "Регистрируем…") : isLoginForm ? "Войти" : "Зарегистрироваться"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {isLoginForm ? (
                  <>
                    Нет аккаунта?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2 hover:opacity-90 cursor-pointer"
                      onClick={() => {
                        setIsLoginForm(false)
                        clearErrors()
                      }}
                      disabled={isPending}
                    >
                      Зарегистрироваться
                    </button>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2 hover:opacity-90 cursor-pointer"
                      onClick={() => {
                        setIsLoginForm(true)
                        clearErrors()
                      }}
                      disabled={isPending}
                    >
                      Войти
                    </button>
                  </>
                )}
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* <div className="bg-muted relative hidden md:block">
            <img
              src="/mug.jpg"
              alt="Изображение"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
