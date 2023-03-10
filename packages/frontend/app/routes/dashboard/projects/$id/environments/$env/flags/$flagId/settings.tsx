import { DashboardLayout } from "~/layouts/DashboardLayout";
import { UserRoles } from "~/modules/projects/types";
import { Section, SectionHeader } from "~/components/Section";
import { DeleteButton } from "~/components/Buttons/DeleteButton";
import { VisuallyHidden } from "~/components/VisuallyHidden";
import { ActionFunction, MetaFunction } from "@remix-run/node";
import { Card, CardContent } from "~/components/Card";
import { FlagMenu } from "~/modules/flags/components/FlagMenu";
import { ButtonCopy } from "~/components/ButtonCopy";
import { useProject } from "~/modules/projects/contexts/useProject";
import { useUser } from "~/modules/user/contexts/useUser";
import { getProjectMetaTitle } from "~/modules/projects/services/getProjectMetaTitle";
import { useEnvironment } from "~/modules/environments/contexts/useEnvironment";
import { getEnvMetaTitle } from "~/modules/environments/services/getEnvMetaTitle";
import { useFlagEnv } from "~/modules/flags/contexts/useFlagEnv";
import { getFlagMetaTitle } from "~/modules/flags/services/getFlagMetaTitle";
import { PageTitle } from "~/components/PageTitle";
import { getSession } from "~/sessions";
import { toggleFlagAction } from "~/modules/flags/form-actions/toggleFlagAction";

export const meta: MetaFunction = ({ parentsData, params }) => {
  const projectName = getProjectMetaTitle(parentsData);
  const envName = getEnvMetaTitle(parentsData, params.env);
  const flagName = getFlagMetaTitle(parentsData);

  return {
    title: `Progressively | ${projectName} | ${envName} | ${flagName} | Settings`,
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

export default function FlagSettingPage() {
  const { project, userRole } = useProject();
  const { user } = useUser();
  const { flagEnv } = useFlagEnv();

  const { environment } = useEnvironment();

  const currentFlag = flagEnv.flag;

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
      <PageTitle value="Settings" />

      <Card
        footer={
          <ButtonCopy toCopy={currentFlag.key} size="M">
            {currentFlag.key}
          </ButtonCopy>
        }
      >
        <CardContent>
          <Section id="general">
            <SectionHeader
              title="General"
              description={
                "The following is the flag key to use inside your application to get the flag variation"
              }
            />
          </Section>
        </CardContent>
      </Card>

      {userRole === UserRoles.Admin && (
        <Card
          footer={
            <DeleteButton
              to={`/dashboard/projects/${project.uuid}/environments/${environment.uuid}/flags/${currentFlag.uuid}/delete`}
            >
              <span aria-hidden>
                <span>Delete </span>
                <span className="hidden md:inline">
                  {currentFlag.name} forever
                </span>
              </span>

              <VisuallyHidden>
                {`Delete ${currentFlag.name} forever`}
              </VisuallyHidden>
            </DeleteButton>
          }
        >
          <CardContent>
            <Section id="danger">
              <SectionHeader
                title="Danger zone"
                titleAs="h3"
                description={
                  "You can delete a feature flag at any time, but you  won't be able to access its insights anymore and false will be served to the application using it."
                }
              />
            </Section>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
