export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
      <p className="mt-2 text-foreground-muted">
        Public user profile will appear here.
      </p>
    </div>
  );
}
