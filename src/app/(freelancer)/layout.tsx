// This layout is specific to the (freelancer) user module.
// It will wrap pages like the dashboard and profile editing.
// It uses the DashboardLayout to provide the sidebar navigation.
import DashboardLayout from './dashboard/layout';

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
