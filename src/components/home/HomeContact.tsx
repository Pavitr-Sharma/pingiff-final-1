import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HomeContact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ firstName: "", lastName: "", message: "" });
  };

  return (
    <section className="bg-background py-16">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">REACH US OUT</h2>
        
        <div className="flex flex-wrap justify-between gap-4 mb-8">
          <p className="text-brown">
            Address: WBI, 1st Floor, Shakarpur, New Delhi 110092
          </p>
          <p className="text-brown">
            Call Us: +91 987654320
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="form-input-styled"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="form-input-styled"
              required
            />
          </div>
          <textarea
            placeholder="Enter Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="form-input-styled resize-y min-h-[120px]"
            rows={4}
            required
          />
          <Button 
            type="submit"
            className="self-center bg-[hsl(30,75%,26%)] hover:bg-[hsl(30,75%,20%)] text-white font-semibold px-8 py-3 rounded-lg btn-hover-lift"
          >
            Submit Enquiry
          </Button>
        </form>
      </div>
    </section>
  );
};

export default HomeContact;