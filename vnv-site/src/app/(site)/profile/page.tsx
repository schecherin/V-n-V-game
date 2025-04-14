import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileMenu from "@/components/menu/profile-menu";

export default function ProfilePage() {
  return (
    <Card>
      <CardContent>
        <ProfileMenu />
      </CardContent>
    </Card>
  );
}
