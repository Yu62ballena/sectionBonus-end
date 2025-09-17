import { CiClock2 } from "react-icons/ci";

type CardDateProps = {
  siteUpdatedAt: string;
};

function CardDate({ siteUpdatedAt }: CardDateProps) {
  // サーバーとクライアントで一貫した形式を使用
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex items-center">
      <CiClock2 className="mr-1" />
      <span>{formatDate(siteUpdatedAt)}</span>
    </div>
  );
}

export default CardDate;