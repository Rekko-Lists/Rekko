import { useState } from "react";

type FAQ = {
    question: string;
    answer: string;
};

interface Props {
    faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                    <div
                        key={index}
                        className="border border-border rounded-xl bg-surface overflow-hidden"
                    >
                        <button
                            className="w-full text-left p-4 font-medium flex justify-between items-center hover:bg-base-200 transition"
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                        >
                            {faq.question}

                            <span className="text-lg">
                                {isOpen ? "−" : "+"}
                            </span>
                        </button>

                        {isOpen && (
                            <div className="px-4 pb-4 text-sm text-base-content/80 leading-7">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
