import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { CalendarDatePicker } from "~/app/account/events/components/date-picker";

export default function CreateEventDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-10">
          Create New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <div>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="limit">Date</Label>
              <CalendarDatePicker />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="limit">Venue</Label>
              <Input id="limit" type="text" placeholder="Enter venue" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                className="min-h-[100px]"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="limit">Capacity</Label>
              <Input
                id="limit"
                type="number"
                placeholder="Enter ticket limit"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Event Image</Label>
              <Input id="image" type="file" />
            </div>
          </form>
        </div>
        <DialogFooter>
          <div>
            <Button variant="ghost">Cancel</Button>
          </div>
          <Button type="submit">Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
