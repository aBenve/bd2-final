import { useUserAuth } from "../store/userStore";
import Card from "./Card";

function CardGrid() {
  const { user } = useUserAuth();

  return (
    <div className="grid w-full grid-flow-row grid-cols-2 grid-rows-2 gap-4">
      <Card type="CBU" content={user?.cbu ?? "?"} />
      <Card type="ALIAS" content={user?.alias ?? "?"} />
      <Card type="EMAIL" content={user?.email ?? "?"} />
      <Card type="PHONE" content={user?.phone ?? "?"} />
    </div>
  );
}

export default CardGrid;
