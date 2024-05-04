'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
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
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"

const page = () => {
    const { toast } = useToast();
    const router = useRouter();
    // zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const response = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password
        })
        console.log("result", response)
        if (response?.error) {
            toast({
                title: "Login failed",
                description: "Incorrect userName or password",
                variant: "destructive"
            })
        }
        if (response?.url) {
            console.log("result", response?.url)
            router.replace('/dashboard')
        }

    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className=" text-4xl font-extrabold tracking-tight lg:text-5xl md-6"></h1>
                    <p className="mb-4">Sign in to start adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email/UserName</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email/UserName"
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
                        <Button type="submit">
                            Sign In
                        </Button>
                    </form>
                    <div className=" text-center mt-4">
                        <p>New a member? {' '}
                            <Link href={'/sign-up'} className=" text-blue-600 hover:text-blue-800">Sign up</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default page


