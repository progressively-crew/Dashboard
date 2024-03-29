import { User } from "~/modules/user/types";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Buttons/Button";
import { HideMobile } from "~/components/HideMobile";
import { CreateButton } from "~/components/Buttons/CreateButton";
import { useProject } from "~/modules/projects/contexts/useProject";

export interface UserDropdownProps {
  user: User;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
  const { project } = useProject();
  return (
    <nav aria-label="User related" className="hidden lg:flex flex-row gap-2 ">
      {project && (
        <CreateButton
          to={`/dashboard/projects/${project.uuid}/flags/create`}
          variant="secondary"
        >
          Create a feature flag
        </CreateButton>
      )}

      <Button
        to="/dashboard/profile"
        className="text-sm"
        icon={<Avatar aria-hidden>{user.fullname}</Avatar>}
        variant="tertiary"
        aria-label={user.fullname}
      >
        <HideMobile>{user.fullname}</HideMobile>
      </Button>
    </nav>
  );
};
