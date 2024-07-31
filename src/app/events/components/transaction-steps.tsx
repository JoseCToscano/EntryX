export default function TransactionSteps() {
  return (
    <div className="flex flex-row items-center justify-center px-6 text-xs">
      <div className="h-32 translate-x-2.5 border-[1px] border-black" />
      <div className="grid w-full max-w-md grid-cols-1 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">Establishing Trustline</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <LockIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">
              Creating buy offer for the asset.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CreditCardIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">Processing offer</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SettingsIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">Executing the transaction</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckIcon className="h-3 w-3" />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-muted-foreground">
              You&apos;re all set! You can now access your tickets on your{" "}
              <a href="/wallet">wallet</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CreditCardIcon(props) {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function LockIcon(props) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SettingsIcon(props) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UserIcon(props) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
