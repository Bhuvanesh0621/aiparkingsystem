import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus, CreditCard, ArrowRight, CheckCircle2, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/store";
import { useStore } from "@/lib/store";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { useRazorpay } from "@/lib/useRazorpay";

export function WalletCard() {
  const { users } = useStore();
  const currentUser = auth.getCurrentUser();
  const user = users.find((u) => u.id === currentUser?.id);
  
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState("500");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  if (!user) return null;

  const isRazorpayLoaded = useRazorpay();

  const handlePaymentSuccess = (paidAmount: number) => {
    if (!user) return;
    store.addFunds(user.id, paidAmount);
    setIsAdding(false);
    toast.success(`Successfully added ₹${paidAmount} to your wallet!`);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!isRazorpayLoaded) {
      toast.error("Razorpay SDK not loaded. Please check your internet connection.");
      return;
    }

    const toastId = toast.loading("Securely initializing payment...");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: val }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order. Is the backend running?");
      }

      const order = await response.json();
      toast.dismiss(toastId);

      const options = {
        key: "rzp_test_TNZpVjGtbaFqJQ",
        amount: order.amount,
        currency: order.currency,
        name: "SmartPark AI",
        description: `Add ₹${val} to Wallet`,
        order_id: order.id,
        handler: function (response: any) {
          store.addFunds(user.id, val);
          toast.success(`Successfully added ₹${val} to your wallet!`);
          setAmount("");
          
          store.addNotification({
            userId: user.id,
            title: "Wallet Recharge Successful",
            message: `₹${val} has been added to your smart wallet.`,
            category: "System",
            priority: "Normal"
          });
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Could not connect to payment server. Ensure the backend is running.");
      console.error(err);
    }
  };
  


  const handleRedeem = () => {
    if (user.rewardPoints < 500) {
      toast.error("You need at least 500 points to redeem!");
      return;
    }
    const success = store.redeemRewardPoints(user.id, 500, 50);
    if (success) {
      toast.success("Redeemed 500 points for ₹50 wallet cash!");
    } else {
      toast.error("Redemption failed.");
    }
  };

  return (
    <>
    <div className="glass rounded-3xl p-5 relative overflow-hidden group col-span-2 lg:col-span-1 flex flex-col justify-between h-full">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-12 -mb-12" />

      <div className="relative flex flex-col h-full z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 glass rounded-2xl bg-white/5 border border-white/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 glass rounded-full border border-primary/20 text-primary">
            Active
          </span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">₹</span>
            <span className="text-3xl font-bold tracking-tight">{user.walletBalance.toLocaleString()}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isAdding ? (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3"
            >
              <Button 
                onClick={() => setIsAdding(true)}
                className="w-full h-8 text-xs rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="adding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAddFunds}
              className="mt-3 space-y-2"
            >
              <div className="space-y-1">
                <Label htmlFor="amount" className="text-xs text-muted-foreground">Select Amount</Label>
                <div className="flex gap-2">
                  {[500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        amount === amt.toString() 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'glass border-white/10 hover:bg-white/5'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input 
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 glass border-white/10 h-10"
                    placeholder="Custom amount"
                  />
                </div>
                <Button type="submit" size="sm" className="h-10 px-4 rounded-xl">
                  Pay
                </Button>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="w-full h-6 text-[10px] text-muted-foreground hover:text-white"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
        
        {/* Eco-Rewards Section */}
        {!isAdding && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
             <div>
               <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> Eco-Rewards</p>
               <div className="text-lg font-bold">{user.rewardPoints || 0} <span className="text-[10px] font-normal text-muted-foreground">pts</span></div>
             </div>
             
             <Button 
               size="sm" 
               variant="outline" 
               onClick={handleRedeem}
               disabled={user.rewardPoints < 500}
               className="h-7 px-2 text-[10px] border-primary/30 text-primary hover:bg-primary/20"
             >
               <Gift className="h-3 w-3 mr-1" />
               Redeem
             </Button>
          </div>
        )}
      </div>
    </div>
    
    </>
  );
}
