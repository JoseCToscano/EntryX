import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ArrowUp, Plus, RefreshCw, Store, X } from "lucide-react";
import Image from "next/image";

export default function TelegramMock() {
  return (
    <div className="flex h-screen flex-col bg-black p-4 text-white">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" className="text-blue-400">
          Close
        </Button>
        <div className="flex items-center">
          <h1 className="mr-1 text-xl font-semibold">Wallet</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-blue-400"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Button variant="ghost" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
      <div className="mb-6 text-center">
        <p className="text-gray-400">Total balance</p>
        <h2 className="text-4xl font-bold">$0.00</h2>
      </div>
      <div className="mb-6 flex justify-between">
        <Button variant="ghost" className="flex flex-col items-center">
          <ArrowUp className="h-6 w-6 text-blue-400" />
          <span className="text-blue-400">Send</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center">
          <Plus className="h-6 w-6 text-blue-400" />
          <span className="text-blue-400">Add Crypto</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center">
          <RefreshCw className="h-6 w-6 text-blue-400" />
          <span className="text-blue-400">Exchange</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center">
          <Store className="h-6 w-6 text-blue-400" />
          <span className="text-blue-400">P2P Market</span>
        </Button>
      </div>
      <Card className="relative mb-4 rounded-xl bg-blue-600 p-4 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-white"
        >
          <X className="h-4 w-4" />
        </Button>
        <h3 className="mb-1 text-lg font-semibold">
          Get up to 50% APY on USDT with Wallet Earn
        </h3>
        <p className="text-sm">Learn more &gt;</p>
        <Image
          src="/placeholder.svg?height=50&width=50"
          width={50}
          height={50}
          alt="Wallet Earn"
          className="absolute bottom-2 right-2"
        />
      </Card>
      <Card className="mb-4 flex items-center justify-between rounded-xl bg-gray-800 p-4">
        <div className="flex items-center">
          <Image
            src="/placeholder.svg?height=40&width=40"
            width={40}
            height={40}
            alt="Wallet Earn"
            className="mr-3"
          />
          <div>
            <h3 className="font-semibold">Wallet Earn</h3>
            <p className="text-sm text-gray-400">Up to 50% APY for 2 months</p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600">Open</Button>
      </Card>
      <Card className="mb-4 flex items-center justify-between rounded-xl bg-gray-800 p-4">
        <div className="flex items-center">
          <Image
            src="/placeholder.svg?height=40&width=40"
            width={40}
            height={40}
            alt="TON Space"
            className="mr-3"
          />
          <div>
            <h3 className="font-semibold">TON Space Beta</h3>
            <p className="text-sm text-gray-400">UQCw...1151</p>
          </div>
        </div>
        <span>$0.00</span>
      </Card>
      <Card className="mb-4 flex items-center justify-between rounded-xl bg-gray-800 p-4">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <span className="text-2xl">$</span>
          </div>
          <h3 className="font-semibold">Dollars</h3>
        </div>
        <div className="text-right">
          <span>$0.00</span>
          <p className="text-sm text-gray-400">0 USDT</p>
        </div>
      </Card>
      <Card className="mb-4 flex items-center justify-between rounded-xl bg-gray-800 p-4">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
            </svg>
          </div>
          <h3 className="font-semibold">More assets</h3>
        </div>
        <span>$0.00</span>
      </Card>
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-2 h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          Transaction history
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  );
}
