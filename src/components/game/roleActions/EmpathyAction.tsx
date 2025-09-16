import { Button } from "@/components/ui/button";
import { RoleAction } from "@/hooks/useRoleActions";

interface EmpathyActionProps {
  onConfirmAction: (roleAction: RoleAction) => void;
}

export default function EmpathyAction({
  onConfirmAction,
}: Readonly<EmpathyActionProps>) {
  return (
    <div>
      <h1>Empathy</h1>
      <Button
        onClick={() =>
          onConfirmAction({
            actionType: "RevealVotesOnTarget",
            targetPlayerId: "",
          })
        }
      >
        Confirm
      </Button>
    </div>
  );
}
