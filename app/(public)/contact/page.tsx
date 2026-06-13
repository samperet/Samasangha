import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import SubscribeForm from "@/components/public/SubscribeForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[#1a2744] mb-4">Get in Touch</h1>
      <p className="text-gray-500 mb-10">
        We&apos;d love to hear from you. Reach out with questions, or sign up to stay connected.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744] mb-4">Send a Message</h2>
          <ContactForm />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a2744] mb-4">Join Our Mailing List</h2>
          <p className="text-gray-600 text-sm mb-4">
            Receive updates on events, teachings, and community news, a few times per month at most.
          </p>
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
