import { useAlertHandler } from "../store/useAlertHandler";
import Alert from "./Alert";

function AlertHandler() {
  const { alerts } = useAlertHandler();

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <ul className="flex flex-col gap-4">
        {alerts.map((alert) => {
          return (
            <li key={alert.id}>
              <Alert alert={alert} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AlertHandler;
