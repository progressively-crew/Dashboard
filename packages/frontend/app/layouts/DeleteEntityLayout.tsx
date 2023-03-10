import React from "react";
import { Card, CardContent } from "~/components/Card";
import { Spacer } from "~/components/Spacer";
import { useProject } from "~/modules/projects/contexts/useProject";
import { UserRoles } from "~/modules/projects/types";

import ForbiddenPage from "~/routes/403";

export interface DeleteEntityLayoutProps {
  children: React.ReactNode;
  error?: React.ReactNode;
  confirmAction?: React.ReactNode;
  cancelAction?: React.ReactNode;
  titleSlot: React.ReactNode;
  backLinkSlot: React.ReactNode;
}

export const DeleteEntityLayout = ({
  children,
  error,
  confirmAction,
  cancelAction,
  titleSlot,
  backLinkSlot,
}: DeleteEntityLayoutProps) => {
  const { userRole } = useProject();

  if (userRole !== UserRoles.Admin) {
    return <ForbiddenPage />;
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 h-full flex-1">
      <main
        className="mx-auto max-w-2xl lg:pt-20 px-4 md:px-12"
        aria-labelledby="page-title"
      >
        {error}
        <Spacer size={4} />

        <div className="inline-block motion-safe:animate-fade-enter-bottom motion-safe:opacity-0">
          {backLinkSlot}
        </div>

        <Spacer size={2} />

        <div
          className="motion-safe:animate-fade-enter-bottom motion-safe:opacity-0"
          style={{
            animationDelay: "300ms",
          }}
        >
          <Card
            scheme="ERROR"
            footer={
              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-8">
                {cancelAction}
                {confirmAction}
              </div>
            }
          >
            <CardContent>
              {titleSlot}
              <Spacer size={8} />
              {children}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
