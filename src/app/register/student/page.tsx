"use client";

import { useEffect, useState } from "react";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { registerStudent } from "../actions";

export const dynamic = "force-dynamic";


export default function StudentRegisterPage() {
  return (
    <div className="container-page py-12 max-w-2xl mx-auto">
      <RegistrationForm role="student" action={registerStudent} fields={[]} />
    </div>
  );
}
