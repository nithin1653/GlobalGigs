// This layout is specific to the (client) user module.
// It will wrap pages like /discover and /freelancers/[id]
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
