import { DashboardLayout } from "~/layouts/DashboardLayout";
import { getSession } from "~/sessions";
import { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { FlagMenu } from "~/modules/flags/components/FlagMenu";
import { useUser } from "~/modules/user/contexts/useUser";
import { useProject } from "~/modules/projects/contexts/useProject";
import { getProjectMetaTitle } from "~/modules/projects/services/getProjectMetaTitle";
import { useEnvironment } from "~/modules/environments/contexts/useEnvironment";
import { getEnvMetaTitle } from "~/modules/environments/services/getEnvMetaTitle";
import { useFlagEnv } from "~/modules/flags/contexts/useFlagEnv";
import { getFlagMetaTitle } from "~/modules/flags/services/getFlagMetaTitle";
import { PageTitle } from "~/components/PageTitle";
import { toggleFlagAction } from "~/modules/flags/form-actions/toggleFlagAction";
import { getActivity } from "~/modules/activity/services/getActivity";
import { Activity } from "~/modules/activity/types";
import { ActivityLogList } from "~/modules/activity/components/ActivityLogList";
import { Typography } from "~/components/Typography";

export const meta: MetaFunction = ({ parentsData, params }) => {
  const projectName = getProjectMetaTitle(parentsData);
  const envName = getEnvMetaTitle(parentsData, params.env);
  const flagName = getFlagMetaTitle(parentsData);

  return {
    title: `Progressively | ${projectName} | ${envName} | ${flagName} | Activity`,
  };
};

type ActionDataType = null | {
  errors?: { [key: string]: string | undefined };
};

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<ActionDataType> => {
  const session = await getSession(request.headers.get("Cookie"));
  const authCookie = session.get("auth-cookie");
  const formData = await request.formData();
  const type = formData.get("_type");

  if (type === "toggle-flag") {
    return toggleFlagAction(formData, params, authCookie);
  }

  return null;
};

interface LoaderData {
  activities: Array<Activity>;
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const session = await getSession(request.headers.get("Cookie"));
  const authCookie = session.get("auth-cookie");
  const activities = await getActivity(params.env!, params.flagId!, authCookie);

  return {
    activities,
  };
};

export default function FlagInsights() {
  const { activities } = useLoaderData<LoaderData>();
  const { flagEnv } = useFlagEnv();
  const { user } = useUser();
  const { project } = useProject();
  const { environment } = useEnvironment();

  return (
    <DashboardLayout
      user={user}
      subNav={
        <FlagMenu
          projectId={project.uuid}
          envId={environment.uuid}
          flagEnv={flagEnv}
        />
      }
    >
      <PageTitle
        value="Activity"
        description={
          <Typography>
            Follow your teammates activity across the app. Get context on what{" "}
            <br />
            has been done by who and when.
          </Typography>
        }
      />

      <ActivityLogList list={activities} flagEnv={flagEnv} />
    </DashboardLayout>
  );
}
