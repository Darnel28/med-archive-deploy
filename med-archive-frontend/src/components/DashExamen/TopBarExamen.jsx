import DashboardTopbar from '../shared/DashboardTopbar.jsx';

export default function TopbarExamen(props) {
  return <DashboardTopbar {...props} notificationsPath="/espaceexamen/notifications" fallbackName="Laboratoire" fallbackRole="Laboratoire" />;
}
