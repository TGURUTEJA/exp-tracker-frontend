import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <h1 className="sr-only">{title}</h1>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
