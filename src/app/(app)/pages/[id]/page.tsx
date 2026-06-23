import { PageDetailView } from "./page-detail-view";

type PageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PageDetailPage({ params }: PageDetailPageProps) {
  const { id } = await params;

  return <PageDetailView pageId={id} />;
}
