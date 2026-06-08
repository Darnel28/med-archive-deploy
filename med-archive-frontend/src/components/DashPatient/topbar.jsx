import DashboardTopbar from '../shared/DashboardTopbar.jsx';

export default function Topbar(props) {
  return <DashboardTopbar {...props} notificationsPath="/espacepatient/notifications" fallbackName="Patient" fallbackRole="Patient" />;
}
