import DashboardTopbar from '../shared/DashboardTopbar.jsx';

export default function TopbarAdmin(props) {
  return <DashboardTopbar {...props} notificationsPath="/espaceadmin/notifications-admin" fallbackName="Administrateur" fallbackRole="Administrateur" />;
}
