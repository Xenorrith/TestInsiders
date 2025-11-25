import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "./ui/field";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/app/api";
import { toast } from "sonner";
import { useLogin } from "@/app/store";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginDialog = () => {
    const setIsAuthenticated = useLogin((state) => state.setLogin);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const success = await login(data.email, data.password);

            if (success) {
                toast("Login Successful");
                setIsAuthenticated(true);
            } else {
                toast("Login failed");
            }
        } catch (error) {
            toast("Login failed");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Sign In</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign In</DialogTitle>
                </DialogHeader>
                <FieldSeparator />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!errors.email}>
                            <FieldLabel>Email</FieldLabel>
                            <Input {...register("email")} required type="email" placeholder="Enter your email" />
                            <FieldError>{errors.email?.message}</FieldError>
                        </Field>
                        <Field data-invalid={!!errors.password}>
                            <FieldLabel>Password</FieldLabel>
                            <Input {...register("password")} required type="password" placeholder="Enter your password" />
                            <FieldError>{errors.password?.message}</FieldError>
                        </Field>
                        <Button variant="default" type="submit">Sign In</Button>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog;