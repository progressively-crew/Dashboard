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
import { ButtonCopy } from "~/components/ButtonCopy";
import { Typography } from "~/components/Typography";
import { Crumbs } from "~/components/Breadcrumbs/types";
import { HideMobile } from "~/components/HideMobile";
import { MetaFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Experiment } from "~/modules/ab/types";
import { getExperimentById } from "~/modules/ab/services/getExperimentById";
import { AbNavBar } from "~/modules/ab/components/AbNavBar";
import { CreateButton } from "~/components/Buttons/CreateButton";
import { EmptyState } from "~/components/EmptyState";
import { Spacer } from "~/components/Spacer";
import { VariantRow } from "~/modules/ab/components/VariantRow";
import { SuccessBox } from "~/components/SuccessBox";

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
    title: `Progressively | ${projectName} | ${envName} | ${experimentName} | Variants`,
  };
};

interface LoaderData {
  project: Project;
  environment: Environment;
  experiment: Experiment;
  user: User;
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const user = await authGuard(request);

  const session = await getSession(request.headers.get("Cookie"));
  const authCookie = session.get("auth-cookie");

  const project: Project = await getProject(params.id!, authCookie, true);

  const environment = project.environments.find(
    (env) => env.uuid === params.env
  );

  const experiment = await getExperimentById(params.experimentId!, authCookie);

  return {
    project,
    environment: environment!,
    experiment,
    user,
  };
};

export default function ExperimentSettingsPage() {
  const [searchParams] = useSearchParams();
  const newVariantId = searchParams.get("newVariantId") || undefined;
  const { project, environment, experiment, user } =
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
      status={
        newVariantId ? (
          <SuccessBox id="variant-added">
            The experiment variant has been successfully created.
          </SuccessBox>
        ) : null
      }
    >
      <Section id="variants">
        <SectionHeader title="Variants" hiddenTitle />

        {experiment.variants.length > 0 ? (
          <div>
            <CreateButton
              to={`/dashboard/projects/${project.uuid}/environments/${environment.uuid}/ab/${experiment.uuid}/variants/create`}
            >
              Add a variant
            </CreateButton>

            <Spacer size={4} />

            <div>
              {experiment.variants.map((variant) => (
                <VariantRow
                  key={variant.uuid}
                  id={variant.uuid}
                  title={variant.name}
                  description={variant.description}
                  variantKey={variant.key}
                  isControl={variant.isControl}
                />
              ))}
            </div>
          </div>
        ) : null}

        {experiment.variants.length === 0 && (
          <EmptyState
            title="No variants found"
            description={
              <Typography>
                There are no variants found to this flag yet.
              </Typography>
            }
            action={
              <CreateButton
                to={`/dashboard/projects/${project.uuid}/environments/${environment.uuid}/ab/${experiment.uuid}/variants/create`}
              >
                Add a variant
              </CreateButton>
            }
          />
        )}
      </Section>
    </DashboardLayout>
  );
}