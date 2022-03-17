import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { IoIosCreate } from "react-icons/io";
import {
  Form,
  useActionData,
  ActionFunction,
  redirect,
  LoaderFunction,
  useLoaderData,
} from "remix";
import { ErrorBox } from "~/components/ErrorBox";
import { Header } from "~/components/Header";
import { Main } from "~/components/Main";
import { Section } from "~/components/Section";
import { authGuard } from "~/modules/auth/auth-guard";
import { createProject } from "~/modules/projects/createProject";
import { CreateProjectDTO, UserProject } from "~/modules/projects/types";
import { validateProjectName } from "~/modules/projects/validateProjectName";
import { User } from "~/modules/user/types";
import { getSession } from "~/sessions";
import { DashboardLayout } from "../../layouts/DashboardLayout";

export const meta = () => {
  return {
    title: "Rollout | Onboarding",
  };
};

interface LoaderData {
  user: User;
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const user = await authGuard(request);

  return { user };
};

interface ActionData {
  errors: Partial<CreateProjectDTO>;
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const formData = await request.formData();
  const projectName = formData.get("project-name")?.toString();

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

export default function OnboardingPage() {
  const { user } = useLoaderData<LoaderData>();
  const data = useActionData<ActionData>();

  const errors = data?.errors;

  return (
    <DashboardLayout user={user}>
      <Main>
        <Box pb={8}>
          <Header
            title="Welcome aboard"
            description={
              <Text>
                Before being fully operational, you will need to create{" "}
                <strong>a project</strong>.
              </Text>
            }
          />
        </Box>

        <Section size="M">
          {errors?.name && (
            <Box pb={4}>
              <ErrorBox list={errors} />
            </Box>
          )}

          <Form method="post">
            <FormControl isInvalid={Boolean(errors?.name)}>
              <FormLabel htmlFor="project-name">Project name</FormLabel>
              <Input
                type="text"
                name="project-name"
                id="project-name"
                placeholder="e.g: My super project"
                aria-describedby={errors?.name ? `error-name` : undefined}
              />
            </FormControl>

            <Flex justifyContent="flex-end" mt={4}>
              <Button
                type="submit"
                leftIcon={<IoIosCreate aria-hidden />}
                colorScheme="brand"
              >
                Create the project
              </Button>
            </Flex>
          </Form>
        </Section>
      </Main>
    </DashboardLayout>
  );
}
