import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignUpForm from "@/components/forms/sign-up-form";

export default function SignUpPage() {
  return (
    <Card className="w-96">
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
