import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqItems = [
  {
    question: "How Car PingMe Tag can reduce parking complaints in Delhi markets?",
    answer: "Our QR tags allow anyone to notify you instantly about parking issues without knowing your phone number, reducing confrontations and complaints.",
  },
  {
    question: "How PingMe decals keep apartment driveways complaint-free?",
    answer: "Neighbors can scan and send alerts about blocking vehicles, ensuring smooth communication without awkward confrontations.",
  },
  {
    question: "Do I need separate tags for bike + helmet combos?",
    answer: "Yes, we recommend separate tags for maximum coverage. Our starter packs include both at discounted rates.",
  },
  {
    question: "Can societies broadcast emergency notices with PingMe?",
    answer: "Yes! Our Society Kit includes emergency broadcast features to alert all registered residents instantly.",
  },
  {
    question: "How quickly can I update backup contacts?",
    answer: "Instantly! Log into your dashboard and update emergency contacts anytime. Changes reflect immediately.",
  },
  {
    question: "What makes PingMe safer than printing a phone number?",
    answer: "Your actual number is never exposed. All calls are masked, and you control who can contact you and how.",
  },
];

const HomeFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-cream py-16">
      <div className="container">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-3xl">❓</span>
          <h2 className="text-2xl md:text-3xl font-bold text-brown">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>
        <p className="text-center text-success mb-8">
          Answers to common questions about PingMe and our services.
        </p>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="faq-item flex-col items-stretch"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center w-full">
                <p className="font-medium text-foreground pr-4">{item.question}</p>
                <span className="text-brown flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </span>
              </div>
              {openIndex === index && (
                <p className="text-muted-foreground text-sm mt-4 pt-4 border-t border-border">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFAQ;