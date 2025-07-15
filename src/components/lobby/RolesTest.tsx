import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

const RolesTest: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    const { data, error } = await supabase.from("roles").select("role_name");
    if (error) {
      console.error("Error fetching roles:", error);
    }
    if (data) {
      setRoles(data.map((role) => role.role_name));
      console.log("Roles data:", data);
    }
  }

  return (
    <ul>
      {roles.map((role, index) => (
        <li key={index} className="text-lg text-brown-dark font-semibold">
          {role}
        </li>
      ))}
    </ul>
  );
};
export default RolesTest;
