import DashboardTopbar from '../shared/DashboardTopbar.jsx';

export default function TopbarHopital(props) {
  return <DashboardTopbar {...props} notificationsPath="/espacehopital/notifications" fallbackName="Établissement" fallbackRole="Hôpital" />;
}
