import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Send } from "lucide-react";

const AdminShipping = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerEmail: "",
    customerName: "",
    orderNumber: "",
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerEmail || !formData.customerName || !formData.orderNumber) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-shipping-notification", {
        body: {
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          orderNumber: formData.orderNumber,
          trackingNumber: formData.trackingNumber || undefined,
          carrier: formData.carrier || undefined,
          estimatedDelivery: formData.estimatedDelivery || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Versandbenachrichtigung gesendet!",
        description: `E-Mail wurde an ${formData.customerEmail} gesendet.`,
      });

      // Reset form
      setFormData({
        customerEmail: "",
        customerName: "",
        orderNumber: "",
        trackingNumber: "",
        carrier: "",
        estimatedDelivery: "",
      });
    } catch (error: any) {
      console.error("Error sending shipping notification:", error);
      toast({
        title: "Fehler",
        description: error.message || "Versandbenachrichtigung konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Versandbenachrichtigung</CardTitle>
            <CardDescription>
              Senden Sie eine Versandbenachrichtigung an den Kunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Kunden-E-Mail *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="kunde@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Kundenname *</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Max Mustermann"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNumber">Bestellnummer *</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="ZAT-12345"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carrier">Versanddienstleister (optional)</Label>
                <Input
                  id="carrier"
                  type="text"
                  placeholder="DHL, DPD, Hermes..."
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Sendungsnummer (optional)</Label>
                <Input
                  id="trackingNumber"
                  type="text"
                  placeholder="1234567890"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Voraussichtliche Lieferung (optional)</Label>
                <Input
                  id="estimatedDelivery"
                  type="text"
                  placeholder="z.B. 20. Dezember 2025"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Versandbenachrichtigung senden
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-4">
          * Pflichtfelder
        </p>
      </div>
    </div>
  );
};

export default AdminShipping;
