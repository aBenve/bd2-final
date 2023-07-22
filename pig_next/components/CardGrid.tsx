import Card from "./Card";

function CardGrid() {
  // TODO: HIT THE API
  return (
    <div className="grid w-full grid-flow-row grid-cols-2 grid-rows-2 gap-4">
      <Card type="CBU" content="123" />
      <Card type="CBU" content="123" />
      <Card type="CBU" content="123" />
      <Card type="CBU" content="123" />
    </div>
  );
}

export default CardGrid;
