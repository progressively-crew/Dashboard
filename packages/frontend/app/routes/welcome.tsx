import { MetaFunction, ActionFunction, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { ErrorBox } from "~/components/Boxes/ErrorBox";
import { Card, CardContent } from "~/components/Card";
import { Spacer } from "~/components/Spacer";
import { Stack } from "~/components/Stack";
import { Typography } from "~/components/Typography";
import { NotAuthenticatedLayout } from "~/layouts/NotAuthenticatedLayout";
import { AuthCredentials } from "~/modules/auth/types";
import {
  registerAction,
  RegisterForm,
} from "~/modules/user/components/RegisterForm";

export const meta: MetaFunction = () => {
  return {
    title: "Progressively | Welcome",
  };
};

interface ActionData {
  errors?: Partial<AuthCredentials & { badUser: string }>;
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const data: ActionData = await registerAction({ request });

  if (data?.errors) {
    return data;
  }

  return redirect("/signin?userCreated=true");
};

export default function WelcomePage() {
  const data = useActionData<ActionData>();
  const errors = data?.errors;

  return (
    <NotAuthenticatedLayout>
      <Stack spacing={4}>
        <div className="text-center motion-safe:animate-fade-enter-top">
          <h1
            className="font-bold text-4xl md:text-5xl dark:text-slate-100"
            id="page-title"
          >
            Congratulations!
          </h1>
          <Spacer size={2} />
          <Typography>
            {`You've`} successfully run your Progressively instance. {`It's`}{" "}
            time to create <strong>your admin user.</strong>
          </Typography>
        </div>

        {errors && Object.keys(errors).length > 0 && <ErrorBox list={errors} />}

        <div
          className="motion-safe:animate-fade-enter-bottom motion-safe:opacity-0"
          style={{
            animationDelay: "500ms",
          }}
        >
          <Card>
            <CardContent>
              <RegisterForm
                errors={errors}
                actionLabel="Create my admin user"
              />
            </CardContent>
          </Card>
        </div>
      </Stack>
    </NotAuthenticatedLayout>
  );
}
