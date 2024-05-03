'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import {
    Form,
    FormField,
    FormControl,
    FormLabel,
    FormItem,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"


const page = () => {
    const [userName, setUserName] = useState('');
    const [userNameMessage, setUserNameMessage] = useState('');
    const [isCheckingUserName, setIsCheckingUserName] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debounce = useDebounceCallback(setUserName, 300)
    const { toast } = useToast();
    const router = useRouter();
    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            userName: '',
            email: '',
            password: ''
        }
    })

    useEffect(() => {
        const userNameUnique = async () => {
            if (userName) {
                setIsCheckingUserName(true);
                setUserNameMessage("")
                try {
                    const response = await axios.get(`/api/check-username-unique?userName=${userName}`);
                    setUserNameMessage(response?.data?.message)
                } catch (error) {
                    const AxiosError = error as AxiosError<ApiResponse>
                    setUserNameMessage(AxiosError?.response?.data?.message ?? "Error checking user name")
                } finally {
                    setIsCheckingUserName(false)
                }
            }
        }
        userNameUnique();
    }, [userName])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/signup`, data)
            toast({
                title: "Success",
                description: response?.data?.message
            })
            router.replace(`/verify/${userName}`)
        } catch (error) {
            console.error("Error in signup", error)
            const AxiosError = error as AxiosError<ApiResponse>
            let errorMessage = AxiosError.response?.data?.message ?? "Error in signup"
            toast({
                title: "Failed",
                description: errorMessage,
                variant: "destructive"
            })

        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className=" text-4xl font-extrabold tracking-tight lg:text-5xl md-6"></h1>
                    <p className="mb-4">Sign up to start adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                        <FormField
                            name="userName"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UserName</FormLabel>
                                    <FormControl>
                                        <Input placeholder="User Name"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debounce(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    {isCheckingUserName && <Loader2 className=" animate-spin" />}
                                    <p className={`text-sm ${userNameMessage === 'User Name is available' ? "text-green-500" : "text-red-500"}`}> tes {userNameMessage}</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>{
                            isSubmitting ? (
                                <>
                                    <Loader2 className=" mr-2 h-4 w-4 animate-spin" /> Please wait...
                                </>
                            ) : "Signup"
                        }</Button>
                    </form>
                    <div className=" text-center mt-4">
                        <p>Already a member? {' '}
                            <Link href={'/sign-in'} className=" text-blue-600 hover:text-blue-800">Sign in</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default page


