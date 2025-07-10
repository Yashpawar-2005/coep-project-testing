"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../compo/Sidebar";
import MainContent from "../compo/Main_content";
import { useParams } from "react-router-dom";
import { api } from "@/services/axios";
import { useTeamStore } from "@/services/atom";

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const { setteamdata } = useTeamStore();
  const { id } = useParams();
  const [admindata,setadminkadata]=useState([])
  // if (!id || loading) {
  //   return <div className="flex h-screen bg-gray-950 text-white justify-center items-center">Loading...</div>;
  // }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <div className="md:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} admindata={admindata} />
      </div>
      <MainContent setadminkadata={setadminkadata} />
    </div>
  );
}
