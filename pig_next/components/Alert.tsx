import { useEffect, useState } from "react";
import { Alert, useAlertHandler } from "../store/useAlertHandler";

function Alert({ alert }: { alert: Alert }) {
  const [visible, setVisible] = useState(true);
  const [hover, setHover] = useState(false);
  const { removeAlert } = useAlertHandler();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      removeAlert(alert.id);
    }, 4000);
    if (hover) {
      clearTimeout(timeout);
    }
    return () => clearTimeout(timeout);
  }, [hover]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${visible ? "flex flex-col gap-1" : "hidden translate-x-10"} 
      ${
        alert.isError
          ? "border-orange-500 bg-orange-800/30 text-orange-600"
          : "border-green-500 bg-green-800/30  text-green-600"
      }
      hover:pause animate-alert relative w-fit min-w-[10rem] max-w-[25rem] rounded-lg
      border-2 border-solid p-4 text-sm transition duration-300 ease-linear hover:cursor-pointer`}
      role="alert"
    >
      <span
        className={`${
          alert.isError ? "bg-orange-400" : "bg-green-400"
        } absolute -left-1.5 -top-1.5 z-50 inline-flex h-3 w-3 animate-ping rounded-full  opacity-75`}
      ></span>
      <span
        className={` ${
          alert.isError ? "bg-orange-500" : "bg-green-500"
        }  absolute -left-1.5 -top-1.5 inline-flex h-3 w-3 rounded-full `}
      ></span>

      {alert.code && <p className="font-bold italic">Code: {alert.code}</p>}
      <p>{alert.message}</p>
    </div>
  );
}

export default Alert;
