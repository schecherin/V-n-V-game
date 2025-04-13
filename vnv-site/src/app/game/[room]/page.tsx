export default async function GameRoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;

  return (
    <div>
      <h1>Game room: {room}</h1>
    </div>
  );
}
