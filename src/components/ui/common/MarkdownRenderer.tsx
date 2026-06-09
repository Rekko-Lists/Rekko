import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    content: string;
}

const styles = {
    h1: "text-4xl font-black tracking-tight mb-8",
    h2: "text-2xl font-bold mt-12 mb-4 border-b border-base-300 pb-2",
    h3: "text-xl font-semibold mt-8 mb-3",
    h4: "text-lg mt-4 mb-2",
    p: "leading-8 text-base-content/80 mb-4",
    ul: "space-y-2 ml-6 list-disc mb-6",
    ol: "space-y-2 ml-6 list-decimal mb-6",
    li: "leading-7",
    blockquote:
        "border-l-4 border-primary bg-base-200/50 rounded-r-xl px-5 py-4 italic my-6",
    divTable: "overflow-x-auto my-8",
    table: "table table-zebra",
    thead: "bg-base-300",
    th: "font-bold",
    hr: "divider my-10",
};

export default function MarkdownRenderer({ content }: Props) {
    return (
        <article className="prose prose-neutral max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => (
                        <h1 className={styles.h1} {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className={styles.h2} {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className={styles.h3} {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className={styles.p} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className={styles.ul} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className={styles.ol} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className={styles.li} {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote className={styles.blockquote} {...props} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className={styles.divTable}>
                            <table className={styles.table} {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className={styles.thead} {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className={styles.th} {...props} />
                    ),
                    td: ({ node, ...props }) => <td {...props} />,
                    hr: ({ node, ...props }) => (
                        <div className={styles.hr} {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
