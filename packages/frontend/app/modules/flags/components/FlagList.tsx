import { CardEntity } from "~/components/Entity/Entity";
import { InitialBox } from "~/components/InitialBox";
import { Flag } from "../types";
import { ButtonCopy } from "~/components/ButtonCopy";
import { IconBox } from "~/components/IconBox";
import { FlagIcon } from "~/components/Icons/FlagIcon";

export interface FlagEnvListProps {
  flags: Array<Flag>;
  projectId: string;
  envId: string;
}

export const FlagList = ({ flags, projectId, envId }: FlagEnvListProps) => {
  return (
    <div className="flex flex-col gap-4">
      {flags.map((flag) => (
        <div key={flag.uuid}>
          <CardEntity
            avatar={
              <IconBox content={flag.name}>
                <FlagIcon />
              </IconBox>
            }
            link={`/dashboard/projects/${projectId}/environments/${envId}/flags/${flag.uuid}`}
            title={flag.name}
            description={flag.description}
            actions={
              <>
                <div className="hidden md:block">
                  <ButtonCopy toCopy={flag.key}>{flag.key}</ButtonCopy>
                </div>
              </>
            }
          />
        </div>
      ))}
    </div>
  );
};
