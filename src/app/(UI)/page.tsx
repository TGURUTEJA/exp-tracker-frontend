
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import PageWrapper from "./PageWrapper";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ErrorBoundary fallback={<div>Error loading data</div>}>
        <PageWrapper />
      </ErrorBoundary>
    </Suspense>
  );
}

