import { Stack, Text, HStack, Link as CLink, Box } from "@chakra-ui/react";
import { MdChevronLeft, MdPassword } from "react-icons/md";
import {
  ActionFunction,
  Form,
  Link,
  MetaFunction,
  useActionData,
  useSearchParams,
  useTransition,
} from "remix";
import { Button } from "~/components/Button";
import { ErrorBox } from "~/components/ErrorBox";
import { TextInput } from "~/components/Fields/TextInput";
import { Header } from "~/components/Header";
import { Main } from "~/components/Main";
import { SuccessBox } from "~/components/SuccessBox";
import { NotAuthenticatedLayout } from "~/layouts/NotAuthenticatedLayout";
import {
  validateConfirmationPassword,
  validatePassword,
} from "~/modules/forms/utils/validatePassword";
import { resetPassword } from "~/modules/user/services/resetPassword";

export const meta: MetaFunction = () => {
  return {
    title: "Progressively | Reset password",
  };
};

interface ActionData {
  success?: boolean;
  errors?: {
    password?: string;
    confirmationPassword?: string;
    token?: string;
    backendError?: string;
  };
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const formData = await request.formData();
  const token = formData.get("token")?.toString();
  const password = formData.get("password")?.toString();
  const confirmationPassword = formData.get("confirmationPassword")?.toString();

  const passwordError = validatePassword(password);
  const confirmationPasswordError =
    validateConfirmationPassword(confirmationPassword);

  if (!token) {
    return {
      errors: {
        token: "The token is missing",
      },
    };
  }

  if (passwordError || confirmationPasswordError) {
    return {
      errors: {
        password: passwordError,
        confirmationPassword: confirmationPasswordError,
      },
    };
  }

  if (password !== confirmationPassword) {
    return {
      errors: {
        password: "The two passwords are not the same.",
      },
    };
  }

  try {
    await resetPassword(password!, token);

    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      return {
        errors: {
          backendError: err.message,
        },
      };
    }

    return { errors: { backendError: "An error ocurred" } };
  }
};

export default function ResetPasswordPage() {
  const data = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const urlToken = searchParams.get("token");
  const success = data?.success;
  const errors = data?.errors;

  return (
    <NotAuthenticatedLayout>
      <Main>
        <HStack mb={4}>
          <MdChevronLeft aria-hidden />
          <CLink as={Link} to="/signin" fontSize="xl" textColor="textlight">
            Back to signin
          </CLink>
        </HStack>

        <Box pb={4}>
          <Header
            title="Reset password"
            description={
              <Text textColor="textlight">Set your new password.</Text>
            }
          />
        </Box>

        <Form method="post">
          <Stack spacing={4} mt={4}>
            {errors && Object.keys(errors).length > 0 && (
              <ErrorBox list={errors} />
            )}

            {success && (
              <SuccessBox id="password-reset">
                The password has been successfully reset. You can now connect.
              </SuccessBox>
            )}

            <input
              type="hidden"
              name="token"
              id="token"
              value={urlToken || ""}
            />

            <TextInput
              isInvalid={Boolean(errors?.password)}
              label="New password"
              name="password"
              placeholder="**********"
            />

            <TextInput
              isInvalid={Boolean(errors?.confirmationPassword)}
              label="Confirmation password"
              name="confirmationPassword"
              placeholder="**********"
            />

            <Box>
              <Button
                type="submit"
                colorScheme={"brand"}
                leftIcon={<MdPassword aria-hidden />}
                isLoading={transition.state === "submitting"}
                loadingText="Password changing in progress, please wait..."
                disabled={false}
              >
                Change password
              </Button>
            </Box>
          </Stack>
        </Form>
      </Main>
    </NotAuthenticatedLayout>
  );
}
