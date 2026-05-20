import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = (createFileRoute as any)("/_authenticated")({
  beforeLoad: async ({ location }: any) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/login" as any,
        search: { redirect: location.href } as any,
      });
    }
  },
  component: () => <Outlet />,
});
