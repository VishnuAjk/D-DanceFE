import { redirect } from 'next/navigation';

export default function LegacyParentRedirect({
  params
}: {
  params: { path?: string[] };
}) {
  const suffix = params.path?.length ? `/${params.path.join('/')}` : '';
  redirect(`/portal${suffix}`);
}
