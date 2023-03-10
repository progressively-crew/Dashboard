import { User } from "~/modules/user/types";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Buttons/Button";
import { HideMobile } from "~/components/HideMobile";
import { ThemeSwitch } from "~/components/ThemeSwitch";

export interface UserDropdownProps {
  user: User;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
  return (
    <nav aria-label="User related" className="hidden lg:flex flex-row gap-2 ">
      <ThemeSwitch />

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
