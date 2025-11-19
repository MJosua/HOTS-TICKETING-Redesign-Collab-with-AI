import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, X, Loader2, User, Calendar } from "lucide-react";
import { API_URL } from "@/config/sourceConfig";
import { toast } from "@/components/ui/use-toast";
import TicketApprovalSection from '@/components/approval/TicketApprovalSection';
import { useAppSelector } from '@/hooks/useAppSelector';

export default function TicketViewPage() {
  const { ticket_id } = useParams();
  const navigate = useNavigate();

  const {  user } = useAppSelector((state) => state.auth);

  const [ticket, setTicket] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  async function load() {
    try {
      const res = await fetch(`${API_URL}/engine/status/${ticket_id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("tokek")}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        toast({ title: "Error", description: "Ticket not found.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const json = await res.json();
      setTicket(json.ticket);
      setEvents(json.events || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load ticket", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [ticket_id]);

  const currentPending = events.find(e => e.status === "waiting");
  const approvedCount = events.filter(e => e.status === "completed").length;
  const totalApprovals = events.filter(e => e.event_type === "approve").length;
  const progress = totalApprovals ? (approvedCount / totalApprovals) * 100 : 0;

  async function handleApprove() {
    try {
      const res = await fetch(`${API_URL}/engine/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokek")}`
        },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          approver_id: 999,
          note: null
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast({ title: "Success", description: "Ticket approved!" });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      console.log("Approve error:", err);
    }
  }

  async function handleReject() {
    try {
      const res = await fetch(`${API_URL}/engine/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokek")}`
        },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          approver_id: 999,
          note: rejectNote
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast({ title: "Rejected", description: "Ticket rejected." });
      setRejectOpen(false);
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center p-10">
        <p>Ticket not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <h1 className="text-2xl font-bold">Ticket #{ticket.ticket_id}</h1>

        <Badge className="capitalize ml-4">{ticket.status}</Badge>
      </div>

      {/* REQUEST INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Request Information asd</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Created By</p>
            <p className="font-medium">{ticket.creator_email || "Unknown"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Service</p>
            <p className="font-medium">{ticket.service_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{ticket.title || "(no title)"}</p>
          </div>
        </CardContent>
      </Card>

      <div >
        {/* Ticket header */}
      

        {/* Approval section */}
        <TicketApprovalSection
          ticket={ticket}
          events={events}
          user={user}
          refresh={load}
          API_URL={API_URL}
        />
      </div>

     

      {/* REJECT MODAL */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Ticket</DialogTitle>
          </DialogHeader>

          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Reason for rejection..."
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
