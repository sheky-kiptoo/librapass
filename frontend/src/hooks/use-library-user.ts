import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type LibraryUser = {
  id: string;
  institution_id: string;
  admission_number: string;
  card_identifier: string;
  full_name: string;
  course: string | null;
  faculty: string | null;
  year: number | null;
  email: string;
  phone_number: string | null;
  user_type: "student" | "staff";
  department: string | null;
};

export type Device = {
  id: string;
  student_id: string;
  name: string;
  manufacturer: string | null;
  serial_number: string | null;
  status: "approved" | "pending" | "flagged";
  registered_on: string;
};

export type Visit = {
  id: string;
  student_id: string;
  device_id: string | null;
  visit_date: string;
  check_in: string;
  check_out: string | null;
  duration_minutes: number | null;
  channel: "qr" | "card" | "web";
  library: string | null;
};

export type Institution = {
  id: string;
  name: string;
  short_name: string | null;
  primary_color: string | null;
  id_format_note: string | null;
};

export function useLibraryUser() {
  const [user, setUser] = useState<LibraryUser | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase
      .from("library_users")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (!userData) {
      setLoading(false);
      return;
    }
    setUser(userData);

    const { data: deviceData } = await supabase
      .from("devices")
      .select("*")
      .eq("student_id", userData.id);
    setDevices(deviceData ?? []);

    const { data: visitData } = await supabase
      .from("visits")
      .select("*")
      .eq("student_id", userData.id)
      .order("visit_date", { ascending: false })
      .order("check_in", { ascending: false });
    setVisits(visitData ?? []);

    const { data: institutionData } = await supabase
      .from("institutions")
      .select("*")
      .eq("id", userData.institution_id)
      .single();
    setInstitution(institutionData ?? null);

    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { user, devices, visits, institution, loading, refetch };
}
