/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vubSKMrbhZw
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export default function ErrorElement() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="rounded-full bg-destructive p-3">
        <TriangleAlertIcon className="h-6 w-6 text-destructive-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-muted-foreground">
          Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
}

function TriangleAlertIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
