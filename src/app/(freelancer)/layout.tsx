// This layout is specific to the (freelancer) user module.
// It will wrap pages like /profile/edit
export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
