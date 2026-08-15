import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CalendarClock, DollarSign, Sparkles, ParkingCircle, CreditCard, MapPin, Wrench, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useStore, store, NotificationCategory } from "@/lib/store";
import { cn } from "@/lib/utils";

const categoryIcons: Record<NotificationCategory, React.ElementType> = {
  Booking: CalendarClock,
  Traffic: MapPin,
  Pricing: DollarSign,
  AI: Sparkles,
  Parking: ParkingCircle,
  Payment: CreditCard,
  Maintenance: Wrench,
  Incident: AlertTriangle,
};

const categoryColors: Record<NotificationCategory, string> = {
  Booking: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Traffic: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  Pricing: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  AI: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  Parking: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  Payment: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  Maintenance: "text-red-500 bg-red-500/10 border-red-500/20",
  Incident: "text-destructive bg-destructive/10 border-destructive/20",
};

export function NotificationsPanel() {
  const { notifications = [], currentUserId, users } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const isAdmin = currentUser?.role === "admin";

  const relevantNotifications = notifications.filter(n => {
    if (isAdmin) {
      // Admins see notifications meant for them or system notifications (no userId)
      return !n.userId || n.userId === currentUserId || n.userId === "admin";
    } else {
      // Regular users see only their notifications and public ones
      return n.userId === currentUserId || n.userId === "public" || n.userId === undefined;
    }
  });

  const unreadCount = relevantNotifications.filter(n => !n.isRead && !n.isDismissed).length;
  const activeNotifications = relevantNotifications.filter(n => !n.isDismissed);


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group transition-transform active:scale-95">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
             <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-glow shadow-red-500/20">
               {unreadCount > 9 ? '9+' : unreadCount}
             </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[90vw] sm:w-[24rem] p-0 overflow-hidden glass border-border/50 rounded-2xl shadow-2xl">
         <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/5 backdrop-blur-sm">
           <h3 className="font-semibold text-base flex items-center gap-2">
             <Sparkles className="h-4 w-4 text-primary" />
             Smart Notifications
           </h3>
           {unreadCount > 0 && (
             <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => store.markAllNotificationsAsRead()}>
               Mark all read
             </Button>
           )}
         </div>
         
         <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-3 space-y-2 relative">
           <AnimatePresence mode="popLayout">
             {activeNotifications.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center text-muted-foreground">
                 <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p className="font-medium">You're all caught up!</p>
                 <p className="text-xs opacity-70 mt-1">AI will notify you when things change.</p>
               </motion.div>
             ) : (
               activeNotifications.map((notif) => {
                 const Icon = categoryIcons[notif.category];
                 const colorClass = categoryColors[notif.category];
                 
                 return (
                   <motion.div
                     layout
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, x: 100 }}
                     transition={{ duration: 0.2 }}
                     key={notif.id}
                     drag="x"
                     dragConstraints={{ left: 0, right: 0 }}
                     dragElastic={0.7}
                     onDragEnd={(e, info) => {
                       if (info.offset.x > 80 || info.offset.x < -80) {
                          store.dismissNotification(notif.id);
                       }
                     }}
                     className={cn(
                       "relative rounded-xl border p-3.5 transition-colors cursor-grab active:cursor-grabbing group overflow-hidden",
                       notif.isRead ? "border-border/40 bg-white/5" : "border-primary/30 bg-primary/5",
                       notif.priority === "High" && !notif.isRead && "border-red-500/40 bg-red-500/10"
                     )}
                     onClick={() => store.markNotificationAsRead(notif.id)}
                   >
                     <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 opacity-0 transition-opacity group-hover:opacity-20 pointer-events-none">
                       <span className="text-[10px] font-medium tracking-widest uppercase rotate-90">Swipe</span>
                     </div>

                     <div className="flex gap-3 relative z-10">
                       <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", colorClass)}>
                         <Icon className="h-4 w-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between gap-2 mb-1.5">
                           <h4 className={cn("text-sm font-semibold truncate", notif.isRead ? "text-foreground" : "text-foreground")}>
                             {notif.title}
                           </h4>
                           <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                             {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                         <p className={cn("text-xs leading-relaxed", notif.isRead ? "text-muted-foreground" : "text-foreground/90")}>
                           {notif.message}
                         </p>
                         
                         {notif.actionLabel && (
                           <Button size="sm" variant={notif.priority === 'High' ? 'default' : 'secondary'} className={cn("mt-3 h-7 text-xs font-semibold shadow-none")} onClick={(e) => {
                              e.stopPropagation();
                              store.markNotificationAsRead(notif.id);
                              if (notif.actionLabel === "View Ticket" && notif.actionData) {
                                store.openTicket(notif.actionData);
                              }
                           }}>
                             {notif.actionLabel}
                           </Button>
                         )}
                       </div>
                     </div>
                     {!notif.isRead && (
                       <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full shadow-[0_0_8px_currentColor]", notif.priority === 'High' ? 'bg-red-500 text-red-500' : 'bg-primary text-primary')} />
                     )}
                   </motion.div>
                 );
               })
             )}
           </AnimatePresence>
         </div>
      </PopoverContent>
    </Popover>
  );
}
