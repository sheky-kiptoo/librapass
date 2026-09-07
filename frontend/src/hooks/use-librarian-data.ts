import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Device, Institution, LibraryUser, Visit } from "@/hooks/use-library-user";

export function useLibrarianData() {
  const [librarianName, setLibrarianName] = useState("");
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [users, setUsers] = useState<LibraryUser[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const { data: librarianRow } = await supabase
      .from("librarians")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (librarianRow) {
      setLibrarianName(librarianRow.full_name);
      const { data: inst } = await supabase
        .from("institutions")
        .select("*")
        .eq("id", librarianRow.institution_id)
        .single();
      setInstitution(inst ?? null);
    }

    const { data: userData } = await supabase.from("library_users").select("*");
    setUsers(userData ?? []);

    const { data: deviceData } = await supabase.from("devices").select("*");
    setDevices(deviceData ?? []);

    const { data: visitData } = await supabase
      .from("visits")
      .select("*")
      .order("visit_date", { ascending: false })
      .order("check_in", { ascending: false });
    setVisits(visitData ?? []);

    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { librarianName, institution, users, devices, visits, loading, refetch };
}