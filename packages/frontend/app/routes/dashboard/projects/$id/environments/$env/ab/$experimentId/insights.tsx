import { BreadCrumbs } from "~/components/Breadcrumbs";
import { DashboardLayout } from "~/layouts/DashboardLayout";
import { authGuard } from "~/modules/auth/services/auth-guard";
import { Environment } from "~/modules/environments/types";
import { getProject } from "~/modules/projects/services/getProject";
import { Project } from "~/modules/projects/types";
import { User } from "~/modules/user/types";
import { getSession } from "~/sessions";
import { Header } from "~/components/Header";
import { Section, SectionHeader } from "~/components/Section";
import { AiOutlineExperiment } from "react-icons/ai";
import { getFlagHits } from "~/modules/flags/services/getFlagHits";
import { ButtonCopy } from "~/components/ButtonCopy";
import { Typography } from "~/components/Typography";
import { Spacer } from "~/components/Spacer";
import { EmptyState } from "~/components/EmptyState";
import { Crumbs } from "~/components/Breadcrumbs/types";
import { HideMobile } from "~/components/HideMobile";
import { MetaFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getExperimentById } from "~/modules/ab/services/getExperimentById";
import { Experiment } from "~/modules/ab/types";
import { AbNavBar } from "~/modules/ab/components/AbNavBar";

interface MetaArgs {
  data?: {
    project?: Project;
    environment?: Environment;
    experiment?: Experiment;
  };
}
export const meta: MetaFunction = ({ data }: MetaArgs) => {
  const projectName = data?.project?.name || "An error ocurred";
  const envName = data?.environment?.name || "An error ocurred";
  const experimentName = data?.experiment?.name || "An error ocurred";

  return {
    title: `Progressively | ${projectName} | ${envName} | ${experimentName} | Insights`,
  };
};

interface VariantHit {
  date: string;
}

interface LoaderData {
  project: Project;
  environment: Environment;
  user: User;
  hits: Array<VariantHit>;
  experiment: Experiment;
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const user = await authGuard(request);
  const session = await getSession(request.headers.get("Cookie"));

  const authCookie = session.get("auth-cookie");

  const project: Project = await getProject(params.id!, authCookie);
  const hits: Array<VariantHit> = await getFlagHits(
    params.env!,
    params.flagId!,
    authCookie
  );

  const environment = project.environments.find(
    (env) => env.uuid === params.env
  );

  const experiment = await getExperimentById(params.experimentId!, authCookie);

  return {
    project,
    environment: environment!,
    user,
    hits,
    experiment,
  };
};

export default function ExperimentInsights() {
  const { project, environment, user, hits, experiment } =
    useLoaderData<LoaderData>();

  const crumbs: Crumbs = [
    {
      link: "/dashboard",
      label: "Projects",
    },
    {
      link: `/dashboard/projects/${project.uuid}`,
      label: project.name,
    },
    {
      link: `/dashboard/projects/${project.uuid}/environments/${environment.uuid}/ab`,
      label: environment.name,
    },
    {
      link: `/dashboard/projects/${project.uuid}/environments/${environment.uuid}/ab/${experiment.uuid}`,
      label: experiment.name,
      forceNotCurrent: true,
      icon: <AiOutlineExperiment aria-hidden />,
    },
  ];

  return (
    <DashboardLayout
      user={user}
      breadcrumb={<BreadCrumbs crumbs={crumbs} />}
      header={
        <Header
          tagline="A/B experiment"
          title={experiment.name}
          startAction={
            <HideMobile>
              <ButtonCopy toCopy={experiment.key}>{experiment.key}</ButtonCopy>
            </HideMobile>
          }
        />
      }
      subNav={
        <AbNavBar
          projectId={project.uuid}
          envId={environment.uuid}
          experimentId={experiment.uuid}
        />
      }
    >
      <Section id="experiment-insights">
        <SectionHeader
          title="Insights"
          description={<Typography>Number of hits per date</Typography>}
        />

        <Spacer size={4} />

        {hits.length === 0 && (
          <EmptyState
            title="No hits found"
            description={
              <Typography>
                There are no hits for the experiment variants. Make sure to
                activate the experiment in order to collect variant hits.
              </Typography>
            }
          />
        )}
      </Section>
    </DashboardLayout>
  );
}
