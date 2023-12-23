import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCcw, ServerOff } from "lucide-react";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      id="error-page"
      className="flex justify-center items-center w-full min-h-screen py-10 px-5 flex-col gap-5"
    >
      <ServerOff className="w-20 h-20 text-zinc-500" />
      <Heading className="max-w-xs text-center">
        Oops! Something went wrong.
      </Heading>
      <Heading variant="caption">
        Error: {error?.message || "Unknown error"}
      </Heading>
      <div className="flex justify-center items-center gap-2.5">
        <Button
          variant={"destructive"}
          onClick={() => window.location.reload()}
          className="hover:bg-red-600 active:scale-95"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reload
        </Button>
        <Button variant={"secondary"} onClick={() => window.history.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
