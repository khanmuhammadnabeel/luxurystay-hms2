import { useParams } from 'react-router-dom';

function RoomDetail() {
  const { id } = useParams();
  return <div className="min-h-screen flex items-center justify-center"><h1>Room Detail: {id}</h1></div>;
}
export default RoomDetail;
