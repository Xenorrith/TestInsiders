import type { TradeType, TradeStatus } from "@/app/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TradesListProps {
  trades: TradeType[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  onChangeStatus: (id: string, status: TradeStatus) => void;
}

const TradesList = ({ trades, isLoading, error, currentUserId, onChangeStatus }: TradesListProps) => {
  if (isLoading) return <p>Loading trades...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!trades.length) return <p>No trades yet.</p>;

  return (
    <ul className="divide-y rounded-md border overflow-hidden">
      {trades.map((trade) => (
        <li key={trade.id}>
          <Card className="bg-input rounded-none border-0">
            <CardContent className="flex flex-col gap-2 py-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Статус:</span>
                <span>{trade.status}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Відправник (book ID):</span>
                <span>{trade.senderBookId}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Отримувач (book ID):</span>
                <span>{trade.receiverBookId}</span>
              </div>

              {trade.status === "PENDING" && currentUserId && (
                <div className="flex gap-2 pt-2 justify-end">
                  {trade.senderId === currentUserId && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onChangeStatus(trade.id, "REJECTED" as TradeStatus)}
                    >
                      Скасувати
                    </Button>
                  )}

                  {trade.receiverId === currentUserId && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onChangeStatus(trade.id, "ACCEPTED" as TradeStatus)}
                      >
                        Прийняти
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onChangeStatus(trade.id, "REJECTED" as TradeStatus)}
                      >
                        Відхилити
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};

export default TradesList;
