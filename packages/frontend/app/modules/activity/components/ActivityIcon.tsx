/* eslint-disable sonarjs/cognitive-complexity */
import { AiOutlineClockCircle, AiOutlineLink } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdGroupWork } from "react-icons/md";
import { FlagIcon } from "~/components/Icons/FlagIcon";
import { MetricIcon } from "~/components/Icons/MetricIcon";
import { VariantIcon } from "~/components/Icons/VariantIcon";
import { ActivityType } from "../types";

export interface ActivityIconProps {
  type: ActivityType;
}

export const ActivityIcon = ({ type }: ActivityIconProps) => {
  if (type === "change-flag-status") {
    return <FlagIcon />;
  }

  if (type === "change-flag-percentage") {
    return <FlagIcon />;
  }

  if (type === "change-variants-percentage") {
    return <VariantIcon />;
  }

  if (type === "delete-variant") {
    return <VariantIcon />;
  }

  if (type === "create-additional-audience") {
    return <HiOutlineUserGroup />;
  }

  if (type === "edit-additional-audience") {
    return <HiOutlineUserGroup />;
  }

  if (type === "delete-additional-audience") {
    return <HiOutlineUserGroup />;
  }

  if (type === "create-eligibility-restriction") {
    return <MdGroupWork />;
  }

  if (type === "delete-eligibility") {
    return <MdGroupWork />;
  }

  if (type === "edit-eligibility") {
    return <MdGroupWork />;
  }

  if (type === "create-webhook") {
    return <AiOutlineLink />;
  }

  if (type === "delete-webhook") {
    return <AiOutlineLink />;
  }

  if (type === "delete-scheduling") {
    return <AiOutlineClockCircle />;
  }

  if (type === "create-scheduling") {
    return <AiOutlineClockCircle />;
  }

  if (type === "create-metric") {
    return <MetricIcon />;
  }

  if (type === "delete-metric") {
    return <MetricIcon />;
  }

  if (type === "create-variant") {
    return <VariantIcon />;
  }

  return <span>Woops, the type {type} is not supported yet.</span>;
};
