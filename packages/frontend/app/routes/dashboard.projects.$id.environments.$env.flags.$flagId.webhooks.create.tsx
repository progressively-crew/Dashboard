import { getSession } from "~/sessions";
import { ErrorBox } from "~/components/Boxes/ErrorBox";
import { ActionFunction, redirect, V2_MetaFunction } from "@remix-run/node";
import { useActionData, Form, useTransition } from "@remix-run/react";
import { useProject } from "~/modules/projects/contexts/useProject";
import { getProjectMetaTitle } from "~/modules/projects/services/getProjectMetaTitle";
import { useEnvironment } from "~/modules/environments/contexts/useEnvironment";
import { getEnvMetaTitle } from "~/modules/environments/services/getEnvMetaTitle";
import { getFlagEnvMetaTitle } from "~/modules/flags/services/getFlagEnvMetaTitle";
import { useFlagEnv } from "~/modules/flags/contexts/useFlagEnv";
import { WebhookCreationDTO, WebhookEvents } from "~/modules/webhooks/types";
import { createWebhook } from "~/modules/webhooks/services/createWebhook";
import { SubmitButton } from "~/components/Buttons/SubmitButton";
import { FormGroup } from "~/components/Fields/FormGroup";
import { SelectField } from "~/components/Fields/Select/SelectField";
import { TextInput } from "~/components/Fields/TextInput";
import { CreateEntityLayout } from "~/layouts/CreateEntityLayout";
import { BackLink } from "~/components/BackLink";
import { CreateEntityTitle } from "~/layouts/CreateEntityTitle";

export const meta: V2_MetaFunction = ({ matches, params }) => {
  const projectName = getProjectMetaTitle(matches);
  const envName = getEnvMetaTitle(matches, params.env!);
  const flagName = getFlagEnvMetaTitle(matches);

  return [
    {
      title: `Progressively | ${projectName} | ${envName} | Flags | ${flagName} | Webhooks | Create`,
    },
  ];
};

interface ActionData {
  errors?: { [key: string]: string };
}

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<ActionData | Response> => {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));

  const event =
    (formData.get("event") as unknown as WebhookEvents) || undefined;
  const endpoint = formData.get("endpoint")?.toString();

  if (!event) {
    return {
      errors: {
        event: "The provided event is invalid",
      },
    };
  }

  if (!endpoint) {
    return {
      errors: {
        endpoint: "The provided endpoint is invalid",
      },
    };
  }

  const webhook: WebhookCreationDTO = {
    event,
    endpoint,
  };

  try {
    await createWebhook(
      params.env!,
      params.flagId!,
      webhook,
      session.get("auth-cookie")
    );

    return redirect(
      `/dashboard/projects/${params.id}/environments/${params.env}/flags/${params.flagId}/webhooks?newWebhook=true#webhook-added`
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { errors: { backendError: error.message } };
    }

    return { errors: { backendError: "An error ocurred" } };
  }
};

export default function CreateWebhookPage() {
  const { project } = useProject();
  const { flagEnv } = useFlagEnv();
  const { environment } = useEnvironment();
  const transition = useTransition();

  const currentFlag = flagEnv.flag;

  const actionData = useActionData<ActionData>();

  return (
    <Form method="post" className="flex flex-col flex-1">
      <CreateEntityLayout
        status={actionData?.errors && <ErrorBox list={actionData.errors} />}
        titleSlot={<CreateEntityTitle>Create a webhook</CreateEntityTitle>}
        submitSlot={
          <SubmitButton
            isLoading={transition.state === "submitting"}
            loadingText="Saving the webhook, please wait..."
          >
            Save the webhook
          </SubmitButton>
        }
        backLinkSlot={
          <BackLink
            to={`/dashboard/projects/${project.uuid}/environments/${environment.uuid}/flags/${currentFlag.uuid}/webhooks`}
          >
            Back to webhooks
          </BackLink>
        }
      >
        <FormGroup>
          <TextInput
            isInvalid={Boolean(actionData?.errors?.["endpoint"])}
            label="Endpoint:"
            placeholder="e.g: https://api.progressively.app/refresh"
            name="endpoint"
          />

          <SelectField
            name="event"
            label="Event:"
            options={[
              {
                value: WebhookEvents.ACTIVATION,
                label: "Flag activation",
              },
              {
                value: WebhookEvents.DEACTIVATION,
                label: "Flag deactivation",
              },
            ]}
          />
        </FormGroup>
      </CreateEntityLayout>
    </Form>
  );
}
