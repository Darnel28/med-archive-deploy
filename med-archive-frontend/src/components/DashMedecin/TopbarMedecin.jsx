import DashboardTopbar from '../shared/DashboardTopbar.jsx';

export default function TopbarMedecin(props) {
  return <DashboardTopbar {...props} notificationsPath="/espacemedecin/notifications" fallbackName="Médecin" fallbackRole="Médecin" />;
}
