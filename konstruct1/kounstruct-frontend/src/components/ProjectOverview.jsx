// src/components/ProjectOverview.jsx
import React from "react";
import ProjectOverviewKpi from "./ProjectOverviewKpi";
import ProjectOverviewOLD from "./ProjectOverviewOLD";

export default function ProjectOverview() {
  return (
    <div className="space-y-6">
      {/* ✅ NEW TOP KPI OVERVIEW */}
      <ProjectOverviewKpi />

      {/* divider */}
      <div className="mx-4 md:mx-6 border-t border-slate-200" />

      {/* ✅ OLD FULL DASHBOARD */}
      {/* <ProjectOverviewLegacy /> */}
      <ProjectOverviewOLD />
    </div>
  );
}
