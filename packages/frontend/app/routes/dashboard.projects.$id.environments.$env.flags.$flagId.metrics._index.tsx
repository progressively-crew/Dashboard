import {
  ActionFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { SuccessBox } from "~/components/Boxes/SuccessBox";
import { CreateButton } from "~/components/Buttons/CreateButton";
import { Card, CardContent } from "~/components/Card";
import { EmptyState } from "~/components/EmptyState";
import { PageTitle } from "~/components/PageTitle";
import { Typography } from "~/components/Typography";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { useEnvironment } from "~/modules/environments/contexts/useEnvironment";
import { getEnvMetaTitle } from "~/modules/environments/services/getEnvMetaTitle";
import { FlagEnvMenu } from "~/modules/flags/components/FlagEnvMenu";
import { MetricList } from "~/modules/flags/components/MetricList";
import { useFlagEnv } from "~/modules/flags/contexts/useFlagEnv";
import { toggleFlagAction } from "~/modules/flags/form-actions/toggleFlagAction";
import { getFlagEnvMetaTitle } from "~/modules/flags/services/getFlagEnvMetaTitle";
import { getMetrics } from "~/modules/flags/services/getMetrics";
import { Metric } from "~/modules/flags/types";
import { useProject } from "~/modules/projects/contexts/useProject";
import { getProjectMetaTitle } from "~/modules/projects/services/getProjectMetaTitle";
import { useUser } from "~/modules/user/contexts/useUser";
import { getSession } from "~/sessions";

export const meta: V2_MetaFunction = ({ matches, params }) => {
  const projectName = getProjectMetaTitle(matches);
  const envName = getEnvMetaTitle(matches, params.env!);
  const flagName = getFlagEnvMetaTitle(matches);

  return [
    {
      title: `Progressively | ${projectName} | ${envName} | Flags | ${flagName} | Metrics`,
    },
  ];
};

interface LoaderData {
  metrics: Array<Metric>;
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const session = await getSession(request.headers.get("Cookie"));
  const authCookie = session.get("auth-cookie");

  const metrics: Array<Metric> = await getMetrics(
    params.env!,
    params.flagId!,
    authCookie
  );

  return {
    metrics,
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

export default function Metrics() {
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { project } = useProject();
  const { environment } = useEnvironment();
  const { flagEnv } = useFlagEnv();

  const isMetricRemoved = searchParams.get("metricRemoved") || undefined;
  const isMetricAdded = searchParams.get("newMetric") || undefined;
  const { metrics } = useLoaderData<LoaderData>();

  const currentFlag = flagEnv.flag;

  const hasMetrics = metrics.length > 0;

  return (
    <DashboardLayout
      user={user}
      subNav={
        <FlagEnvMenu
          projectId={project.uuid}
          envId={environment.uuid}
          flagEnv={flagEnv}
        />
      }
      status={
        isMetricRemoved ? (
          <SuccessBox id="metric-removed">
            The metric has been successfully removed.
          </SuccessBox>
        ) : isMetricAdded ? (
          <SuccessBox id="metric-added">
            The metric has been successfully added.
          </SuccessBox>
        ) : null
      }
    >
      <PageTitle
        value="Metrics"
        description={
          <Typography>
            The metrics that you have to measure the impact of your flags.
          </Typography>
        }
        action={
          hasMetrics && (
            <CreateButton
              to={`/dashboard/projects/${project.uuid}/environments/${environment.uuid}/flags/${currentFlag.uuid}/metrics/create`}
            >
              Create a metric
            </CreateButton>
          )
        }
      />

      {!hasMetrics && (
        <Card>
          <CardContent>
            <EmptyState
              titleAs="h2"
              title="No metrics found"
              description={"There are no metrics for this flag."}
              action={
                <CreateButton
                  to={`/dashboard/projects/${project.uuid}/environments/${environment.uuid}/flags/${currentFlag.uuid}/metrics/create`}
                >
                  Create a metric
                </CreateButton>
              }
            />
          </CardContent>
        </Card>
      )}

      {hasMetrics && (
        <MetricList
          metrics={metrics}
          projectId={project.uuid}
          envId={environment.uuid}
          flagId={currentFlag.uuid}
        />
      )}
    </DashboardLayout>
  );
}
