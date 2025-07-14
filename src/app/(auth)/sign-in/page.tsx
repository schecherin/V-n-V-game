import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInForm from "@/components/forms/sign-in-form";

export default function SignInPage() {
  return (
    <Card className="w-96">
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
}
