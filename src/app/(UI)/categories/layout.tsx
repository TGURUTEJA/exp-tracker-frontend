import CategoriesPageTQ from "@/DataPreFetch/CategoriesPageTQ";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>loading...</div>}>
        <ErrorBoundary fallback={<div>Error loading data</div>}>
            <CategoriesPageTQ>
                {children}
            </CategoriesPageTQ>
        </ErrorBoundary>
    </Suspense>
    );
}
