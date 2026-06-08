import DashboardTopbar from '../shared/DashboardTopbar.jsx';

export default function TopbarAccueil(props) {
  return <DashboardTopbar {...props} notificationsPath="/espaceaccueil/notifications" fallbackName="Accueil" fallbackRole="Service accueil" />;
}
