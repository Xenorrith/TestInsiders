import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerAPI } from "@/app/api";
import { toast } from "sonner";
import { useLogin } from "@/app/store";

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterDialog = () => {
    const setIsAuthenticated = useLogin((state) => state.setLogin);
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const success = await registerAPI(data.email, data.username, data.password);
            if (success) {
                toast("Registration successful");
                setIsAuthenticated(true);
            }
        } catch (error) {
            toast("Registration failed");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">Sign Up</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign Up</DialogTitle>
                </DialogHeader>
                <FieldSeparator />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!errors.username}>
                            <FieldLabel>Username</FieldLabel>
                            <Input {...register("username")} required type="text" placeholder="Enter your username" />
                            <FieldError>{errors.username?.message}</FieldError>
                        </Field>
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
                        <Button variant="default" type="submit">Sign Up</Button>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterDialog;