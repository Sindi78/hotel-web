import RoomDetails from './RoomDetails';

export default async function RoomPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  return <RoomDetails slug={resolvedParams.slug} />;
}
