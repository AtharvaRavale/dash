// src/components/ProjectOverview.jsx
import React from "react";
import ProjectOverviewKpi from "./ProjectOverviewKpi";
import ProjectOverviewOLD from "./ProjectOverviewOLD";

export default function ProjectOverview() {
  return (
    <div className="space-y-2">
      {/* ✅ NEW TOP KPI OVERVIEW */}
      <ProjectOverviewKpi />

      {/* divider */}
      <div className="mx-2 md:mx-4 border-t border-slate-200" />

      {/* ✅ OLD FULL DASHBOARD */}
      {/* <ProjectOverviewLegacy /> */}
      <ProjectOverviewOLD />
    </div>
  );
}
