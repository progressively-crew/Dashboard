import { ErrorBox } from "~/components/Boxes/ErrorBox";
import { createProject } from "~/modules/projects/services/createProject";
import { CreateProjectDTO, UserProject } from "~/modules/projects/types";
import { validateProjectName } from "~/modules/projects/validators/validateProjectName";
import { getSession } from "~/sessions";
import { TextInput } from "~/components/Fields/TextInput";
import { SubmitButton } from "~/components/Buttons/SubmitButton";
import { ActionFunction, redirect, V2_MetaFunction } from "@remix-run/node";
import { useActionData, Form, useTransition } from "@remix-run/react";
import { CreateEntityLayout } from "~/layouts/CreateEntityLayout";
import { BackLink } from "~/components/BackLink";
import { CreateEntityTitle } from "~/layouts/CreateEntityTitle";

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Progressively | Create a project",
    },
  ];
};

interface ActionData {
  errors: Partial<CreateProjectDTO>;
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const formData = await request.formData();
  const projectName = formData.get("name")?.toString();

  const errors = validateProjectName({ name: projectName });

  if (errors?.name) {
    return { errors };
  }

  const session = await getSession(request.headers.get("Cookie"));

  const userProject: UserProject = await createProject(
    projectName!,
    session.get("auth-cookie")
  );

  return redirect(
    `/dashboard?newProjectId=${userProject.projectId}#project-added`
  );
};

export default function CreateProjectPage() {
  const data = useActionData<ActionData>();
  const transition = useTransition();
  const errors = data?.errors;

  return (
    <Form method="post" className="flex flex-col flex-1">
      <CreateEntityLayout
        status={errors?.name && <ErrorBox list={errors} />}
        titleSlot={<CreateEntityTitle>Create a project</CreateEntityTitle>}
        submitSlot={
          <SubmitButton
            type="submit"
            isLoading={transition.state === "submitting"}
            loadingText="Creating the project, please wait..."
          >
            Create the project
          </SubmitButton>
        }
        backLinkSlot={<BackLink to={`/dashboard`}>Back to projects</BackLink>}
      >
        <TextInput
          isInvalid={Boolean(errors?.name)}
          label="Project name"
          name="name"
          placeholder="e.g: My super project"
        />
      </CreateEntityLayout>
    </Form>
  );
}
