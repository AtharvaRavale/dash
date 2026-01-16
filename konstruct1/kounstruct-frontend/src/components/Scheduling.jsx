
// Scheduling.jsx — UI styled version + ✅ Checklist Scheduling APIs
import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../ThemeContext";
import {
  getSchedulingSetup,          // ✅ keep using setup (structure/users/purposes)
  Allprojects,
  getProjectsByOwnership,
  getchecklistbyProject,       // ✅ to load checklists for selected project
  createChecklistSchedule,     // ✅ NEW: POST checklists/api/scheduling/schedules/create/
} from "../api";
import { NEWchecklistInstance ,projectInstance} from "../api/axiosInstance"; // ✅ for list endpoints (fallbacks)

function useActiveProjectId() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("project_id");
    if (q) return Number(q);
  } catch {}
  const ls =
    localStorage.getItem("ACTIVE_PROJECT_ID") ||
    localStorage.getItem("PROJECT_ID");
  return ls ? Number(ls) : null;
}

const MAX_REMIND_DAYS = 31;

// ✅ small helper: try multiple endpoints (only fallback on 404)
const __getWithFallback = async (instance, urls = [], config = {}) => {
  let lastErr = null;
  for (const url of urls) {
    try {
      return await instance.get(url, config);
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      if (status && status !== 404) throw err;
      if (!err?.response) throw err;
    }
  }
  throw lastErr;
};

const Scheduling = () => {
  const { theme } = useTheme();

  // THEME palette
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#222";
  const iconColor = ORANGE;

  // ---- Project selection (role-aware) ----
  const [projectId, setProjectId] = useState(useActiveProjectId());
  const [projects, setProjects] = useState([]);

  const setActiveProject = (idOrEmpty) => {
    const id = idOrEmpty ? Number(idOrEmpty) : null;
    setProjectId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("project_id", String(id));
    else url.searchParams.delete("project_id");
    window.history.replaceState({}, "", url.toString());
    if (id) {
      localStorage.setItem("ACTIVE_PROJECT_ID", String(id));
      localStorage.setItem("PROJECT_ID", String(id));
    } else {
      localStorage.removeItem("ACTIVE_PROJECT_ID");
      localStorage.removeItem("PROJECT_ID");
    }
  };
  


  useEffect(() => {
    const loadProjects = async () => {
      try {
        const role = (localStorage.getItem("ROLE") || "").toLowerCase();
        const userStr = localStorage.getItem("USER_DATA");
        const user =
          userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

        let resp = null;

        if (role === "super admin") {
          resp = await Allprojects();
        } else if (role === "manager" || role === "admin") {
          const orgId = user?.org || user?.organization_id;
          if (!orgId) {
            setProjects([]);
            return;
          }
          resp = await getProjectsByOwnership({
            organization_id: orgId,
            company_id: null,
            entity_id: null,
          });
        } else if (user) {
          const orgId = user?.org || user?.organization_id || null;
          const companyId = orgId ? null : user?.company_id || null;
          const entityId = orgId || companyId ? null : user?.entity_id || null;

          resp = await getProjectsByOwnership({
            organization_id: orgId,
            company_id: companyId,
            entity_id: entityId,
          });
        }

        const list = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp?.data?.results)
          ? resp.data.results
          : resp?.data || [];

        setProjects(list);

        if (!projectId && list.length === 1) {
          setActiveProject(list[0].id);
        }
      } catch (e) {
        console.error("[Scheduling] loadProjects failed", e);
        setProjects([]);
        toast.error("Failed to fetch projects");
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Scheduling setup/list state ----
  const [setupLoading, setSetupLoading] = useState(false);
  const [setup, setSetup] = useState(null);
  const [open, setOpen] = useState(false);

  // ✅ project checklists
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklistIds, setSelectedChecklistIds] = useState([]);

  // form state
  // const [selectedStageId, setSelectedStageId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remindDays, setRemindDays] = useState(0);

  //new
  // form state (scope filters)
const [selectedPurposeId, setSelectedPurposeId] = useState("");
const [selectedPhaseId, setSelectedPhaseId] = useState("");
const [selectedStageId, setSelectedStageId] = useState("");

// ✅ Apply button logic
const [scopeApplied, setScopeApplied] = useState(false);

// ✅ project checklists
// const [checklistsLoading, setChecklistsLoading] = useState(false);
const [allProjectChecklists, setAllProjectChecklists] = useState([]); // full list
// const [checklists, setChecklists] = useState([]); // filtered after Apply
// const [selectedChecklistIds, setSelectedChecklistIds] = useState([]);

// ✅ Checkers
const [filteredCheckers, setFilteredCheckers] = useState([]);
// const [checkerUserIds, setCheckerUserIds] = useState([]);
 const [roomNameById, setRoomNameById] = useState({});

  //new

  // ✅ Checkers (same dropdown UI, but now used as checker_user_ids)
  const [checkerUserIds, setCheckerUserIds] = useState([]);

  // selection state
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [selectedBuildings, setSelectedBuildings] = useState(new Set());
  const [selectedFloorsByBuilding, setSelectedFloorsByBuilding] = useState({});
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [selectedFlatsByLevel, setSelectedFlatsByLevel] = useState({});

  // lists
  const [listLoading, setListLoading] = useState(false);
  const [schedulesList, setSchedulesList] = useState(null);
  const [myList, setMyList] = useState(null);
  const [tab, setTab] = useState("all"); // "all" | "my"
  const resetModal = () => {
  setSelectedPurposeId("");
  setSelectedPhaseId("");
  setSelectedStageId("");
  setScopeApplied(false);

  setStartDate("");
  setEndDate("");
  setRemindDays(0);

  setSelectedChecklistIds([]);
  setCheckerUserIds([]);

  setChecklists([]);
  setFilteredCheckers([]);

  setActiveBuildingId(null);
  setSelectedBuildings(new Set());
  setSelectedFloorsByBuilding({});
  setActiveLevelId(null);
  setSelectedFlatsByLevel({});
};
useEffect(() => {
  setScopeApplied(false);
  setChecklists([]);
  setSelectedChecklistIds([]);
  setFilteredCheckers([]);
  setCheckerUserIds([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedPurposeId, selectedPhaseId, selectedStageId]);

 
  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      try {
        setSetupLoading(true);
        const { data } = await getSchedulingSetup(projectId);
        setSetup(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load scheduling setup");
      } finally {
        setSetupLoading(false);
      }
    };
    load();
  }, [projectId]);

  // ✅ Load checklists for selected project
  useEffect(() => {
  if (!projectId) {
    setAllProjectChecklists([]);
    setChecklists([]);
    setSelectedChecklistIds([]);
    setScopeApplied(false);
    return;
  }

  const loadAll = async () => {
    try {
      setChecklistsLoading(true);
      const res = await getchecklistbyProject(projectId);
      const data = res?.data;

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : data?.checklists || data?.items || [];

      const norm = arr
  .map((c) => ({
    id: Number(c?.id),

    name: c?.name ?? `Checklist #${c?.id}`,

    // ✅ ADD THIS
    status: String(c?.status || "").toLowerCase(),

    purpose_id: c?.purpose_id != null ? Number(c.purpose_id) : null,
    phase_id: c?.phase_id != null ? Number(c.phase_id) : null,
    stage_id: c?.stage_id != null ? Number(c.stage_id) : null,

    building_id: c?.building_id != null ? Number(c.building_id) : null,
    level_id: c?.level_id != null ? Number(c.level_id) : null,
    flat_id: c?.flat_id != null ? Number(c.flat_id) : null,

    room_id:
      c?.room_id != null
        ? Number(c.room_id)
        : c?.items?.[0]?.room_id != null
        ? Number(c.items[0].room_id)
        : null,
  }))
  .filter((c) => Number.isFinite(c.id));




      setAllProjectChecklists(norm);

      // scoped list empty until Apply
      setChecklists([]);
      setSelectedChecklistIds([]);
      setScopeApplied(false);
    } catch (e) {
      console.error(e);
      setAllProjectChecklists([]);
      setChecklists([]);
      toast.error("Failed to load checklists");
    } finally {
      setChecklistsLoading(false);
    }
  };

  loadAll();
}, [projectId]);

// ✅ flat_id -> flat number mapping (from setup.structure)
const flatNumberById = useMemo(() => {
  const map = {};
  const bs = setup?.structure?.buildings || [];

  bs.forEach((b) => {
    (b.levels || []).forEach((lvl) => {
      (lvl.level_orphan_flats || []).forEach((f) => {
        const id = Number(f?.id);
        if (!Number.isFinite(id)) return;

        // most important: f.number (you are already using it in flats list)
        map[id] =
          f?.number ??
          f?.flat_number ??
          f?.flat_no ??
          f?.name ??
          String(id);
      });
    });
  });

  return map;
}, [setup]);

useEffect(() => {
  if (!projectId) {
    setRoomNameById({});
    return;
  }

  const loadRooms = async () => {
    try {
      // This hits: https://konstruct.world/projects/rooms/?project_id=126
      const { data } = await __getWithFallback(
        projectInstance,
        ["/rooms/", "/rooms"],
        {
          params: { project_id: projectId },
          headers: { "Content-Type": "application/json" },
        }
      );

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      const map = {};
      arr.forEach((r) => {
        const id = Number(r?.id);
        if (!Number.isFinite(id)) return;
        map[id] = r?.rooms || r?.name || `Room #${id}`;
      });

      setRoomNameById(map);
    } catch (e) {
      console.error("[Scheduling] loadRooms failed", e);
      setRoomNameById({});
    }
  };

  loadRooms();
}, [projectId]);

  
  // ---- Load lists (tab-aware) ----
  const fetchActiveTab = async () => {
    if (!projectId) return;
    try {
      setListLoading(true);

      // ✅ Checklist scheduling list endpoints (try a few common routes)
      const urlsAll = [
        "/scheduling/schedules/list/",
        "/scheduling/schedules/",
        "/scheduling/list/",
        "/scheduling/",
      ];
      const urlsMy = [
        "/scheduling/schedules/my/",
        "/scheduling/my/",
        "/scheduling/schedules/me/",
      ];

      if (tab === "all") {
        const { data } = await __getWithFallback(NEWchecklistInstance, urlsAll, {
          params: { project_id: projectId },
          headers: { "Content-Type": "application/json" },
        });
        setSchedulesList(data);
      } else {
        const { data } = await __getWithFallback(NEWchecklistInstance, urlsMy, {
          params: { project_id: projectId },
          headers: { "Content-Type": "application/json" },
        });
        setMyList(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load schedules");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, tab]);

  // ---- Derived options ----
  const purposeOptions = useMemo(() => {
  return Array.isArray(setup?.purposes) ? setup.purposes : [];
}, [setup]);

const phaseOptions = useMemo(() => {
  if (!selectedPurposeId) return [];
  const p = purposeOptions.find((x) => String(x.id) === String(selectedPurposeId));
  return Array.isArray(p?.phases) ? p.phases : [];
}, [purposeOptions, selectedPurposeId]);

const stageOptions = useMemo(() => {
  if (!selectedPhaseId) return [];
  const ph = phaseOptions.find((x) => String(x.id) === String(selectedPhaseId));
  return Array.isArray(ph?.stages) ? ph.stages : [];
}, [phaseOptions, selectedPhaseId]);

  
  const normRole = (r) =>
    String(typeof r === "string" ? r : r?.role || r?.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const isExcludedUser = (u) => {
    const roles = Array.isArray(u?.roles) ? u.roles : [];
    return roles.some((r) => {
      const n = normRole(r);
      return n === "staff" || n === "security_guard";
    });
  };

  const users = useMemo(() => {
    const list = Array.isArray(setup?.users) ? setup.users : [];
    return list.filter((u) => !isExcludedUser(u));
  }, [setup]);

  const buildings = useMemo(() => setup?.structure?.buildings || [], [setup]);

  const activeBuilding = useMemo(
    () => buildings.find((b) => b.id === activeBuildingId) || null,
    [buildings, activeBuildingId]
  );
const isCheckerUser = (u) => {
  const roles = Array.isArray(u?.roles) ? u.roles : [];
  return roles.some((r) => normRole(r) === "checker");
};

const applyScopeFilters = () => {
  if (!selectedPurposeId || !selectedPhaseId || !selectedStageId) {
    toast.error("Please select Purpose + Phase + Stage first");
    return;
  }

  const hasAnyTower = selectedBuildings.size > 0;
  if (!hasAnyTower) {
    toast.error("Please select at least one Tower first");
    return;
  }

  const pId = Number(selectedPurposeId);
  const phId = Number(selectedPhaseId);
  const stId = Number(selectedStageId);

  const selectedTowerIds = Array.from(selectedBuildings).map(Number);

  const getTowerName = (towerId) =>
    buildings.find((b) => Number(b.id) === Number(towerId))?.name ||
    `Tower #${towerId}`;

  // ✅ NEW: Detect "tower-only selection" (no floor selected anywhere)
  const anyFloorSelected = Object.values(selectedFloorsByBuilding).some(
    (s) => s && s.size > 0
  );

  if (!anyFloorSelected) {
    // ✅ TOWER ONLY MODE: load ONLY tower-level checklists
    // tower-level = building_id present + level_id/flat_id/room_id all null
    const towerOnly = allProjectChecklists.filter((c) => {
  const scopeOk =
    Number(c.purpose_id) === pId &&
    Number(c.phase_id) === phId &&
    Number(c.stage_id) === stId;

  const towerOk =
    c.building_id != null && selectedTowerIds.includes(Number(c.building_id));

  const isTowerChecklist =
    c.level_id == null && c.flat_id == null && c.room_id == null;

  // ✅ ADD THIS
  const statusOk = String(c.status || "").toLowerCase() === "not_started";

  return scopeOk && towerOk && isTowerChecklist && statusOk;
});


    const decorated = towerOnly.map((c) => ({
      ...c,
      name: `Tower:${getTowerName(c.building_id)} • ${c.name}`,
    }));

    setChecklists(decorated);
    setSelectedChecklistIds([]);

    const onlyCheckers = users.filter((u) => isCheckerUser(u));
    setFilteredCheckers(onlyCheckers);
    setCheckerUserIds([]);

    setScopeApplied(true);

    if (!decorated.length)
      toast("No tower checklists found for selected towers", { icon: "ℹ️" });

    return; // ✅ IMPORTANT: stop here
  }

  // ✅ EXISTING FLOOR/FLAT logic (unchanged)
  if (mappingsPreview.length === 0) {
    toast.error("Please select Tower + Floor first");
    return;
  }

  const targets = buildTargets();

  // ✅ STRICT mode case: user selected flats but still zero targets => error
  const anyFlatSelected = Object.values(selectedFlatsByLevel).some(
    (s) => s && s.size > 0
  );
  if (anyFlatSelected && targets.length === 0) {
    toast.error("Please select at least one Flat (e.g. 901)");
    return;
  }

  const flatIdSet = new Set(targets.map((t) => Number(t.flat_id)));

  const scoped = allProjectChecklists.filter((c) => {
  const scopeOk =
    Number(c.purpose_id) === pId &&
    Number(c.phase_id) === phId &&
    Number(c.stage_id) === stId;

  const flatOk = anyFlatSelected ? flatIdSet.has(Number(c.flat_id)) : true;

  const floorOk = !anyFlatSelected
    ? flatIdSet.has(Number(c.flat_id))
    : true;

  // ✅ ADD THIS
  const statusOk = String(c.status || "").toLowerCase() === "not_started";

  return scopeOk && flatOk && floorOk && statusOk;
});


 const decorated = scoped.map((c) => {
  const flatId = c?.flat_id != null ? Number(c.flat_id) : null;
  const roomId = c?.room_id != null ? Number(c.room_id) : null;

  const flatLabel =
    flatId != null ? (flatNumberById[flatId] ?? `#${flatId}`) : "-";

  const roomLabel =
    roomId != null ? (roomNameById[roomId] ?? `Room #${roomId}`) : "-";

  return {
    ...c,
    // ✅ dropdown me ab flat number + room name dikhega
    name: `Flat:${flatLabel} • Room:${roomLabel} • ${c.name}`,
  };
});

  setChecklists(decorated);
  setSelectedChecklistIds([]);

  const onlyCheckers = users.filter((u) => isCheckerUser(u));
  setFilteredCheckers(onlyCheckers);
  setCheckerUserIds([]);

  setScopeApplied(true);

  if (!decorated.length)
    toast("No checklists found for selected flat(s)", { icon: "ℹ️" });
};

  // sort floors numerically: B2 < B1 < G(0) < 1 < 2 ...
  const floorNumberFromLevel = (lvl) => {
    const numericFields = [
      lvl.order,
      lvl.sequence,
      lvl.seq,
      lvl.index,
      lvl.position,
      lvl.level_no,
      lvl.level_number,
      lvl.number,
      lvl.floor_no,
      lvl.floor_number,
    ];
    for (const v of numericFields) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    const name = String(lvl?.name || "").trim().toLowerCase();
    if (/^(g|ground)\b/.test(name)) return 0;
    const mb = name.match(/^b(?:asement)?\s*(\d+)/);
    if (mb) return -Number(mb[1]);
    const m = name.match(/-?\d+/);
    if (m) return Number(m[0]);
    return Number.MAX_SAFE_INTEGER;
  };
  const byFloorAsc = (a, b) => floorNumberFromLevel(a) - floorNumberFromLevel(b);

  const activeFloors = useMemo(() => {
    const arr = activeBuilding?.levels || [];
    return [...arr].sort(byFloorAsc);
  }, [activeBuilding]);

  const activeLevel = useMemo(
    () => activeFloors.find((l) => l.id === activeLevelId) || null,
    [activeFloors, activeLevelId]
  );
  const activeFlats = useMemo(
    () => activeLevel?.level_orphan_flats || [],
    [activeLevel]
  );

  const allowedRemindMax = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate + "T00:00:00");
    const e = new Date(endDate + "T00:00:00");
    const diff = Math.floor((e - s) / 86400000);
    return Math.max(0, Math.min(MAX_REMIND_DAYS, diff));
  }, [startDate, endDate]);

  useEffect(() => {
    if (remindDays > allowedRemindMax) {
      setRemindDays(allowedRemindMax);
    }
  }, [allowedRemindMax, remindDays]);

  // ---- Selection handlers ----
  const toggleBuilding = (bId) => {
    setActiveBuildingId(bId);
    setActiveLevelId(null);
    setSelectedBuildings((prev) => {
      const next = new Set(prev);
      next.has(bId) ? next.delete(bId) : next.add(bId);
      return next;
    });
  };

  const isLevelSelected = (bId, levelId) =>
    (selectedFloorsByBuilding[bId]?.has(levelId)) || false;

  const toggleLevel = (bId, levelId) => {
    setActiveLevelId(levelId);
    setSelectedFloorsByBuilding((prev) => {
      const prevSet = prev[bId] ? new Set(prev[bId]) : new Set();
      prevSet.has(levelId) ? prevSet.delete(levelId) : prevSet.add(levelId);
      return { ...prev, [bId]: prevSet };
    });
  };

  const selectAllFloorsForActiveBuilding = (checked) => {
    if (!activeBuilding) return;
    setSelectedFloorsByBuilding((prev) => {
      if (checked) {
        return {
          ...prev,
          [activeBuilding.id]: new Set(activeFloors.map((f) => f.id)),
        };
      }
      return { ...prev, [activeBuilding.id]: new Set() };
    });
  };

  const isFlatSelected = (levelId, flatId) =>
    (selectedFlatsByLevel[levelId]?.has(flatId)) || false;

  const toggleFlat = (levelId, flatId) => {
    setSelectedFlatsByLevel((prev) => {
      const prevSet = prev[levelId] ? new Set(prev[levelId]) : new Set();
      prevSet.has(flatId) ? prevSet.delete(flatId) : prevSet.add(flatId);
      return { ...prev, [levelId]: prevSet };
    });
  };

  const selectAllFlatsForActiveLevel = (checked) => {
    if (!activeLevel) return;
    setSelectedFlatsByLevel((prev) => {
      if (checked) {
        return {
          ...prev,
          [activeLevel.id]: new Set(activeFlats.map((f) => f.id)),
        };
      }
      return { ...prev, [activeLevel.id]: new Set() };
    });
  };

  // ---- Preview mapping ----
  const mappingsPreview = useMemo(() => {
    const rows = [];
    selectedBuildings.forEach((bId) => {
      const building = buildings.find((b) => b.id === bId);
      if (!building) return;
      const selectedLevels = Array.from(selectedFloorsByBuilding[bId] || []);
      selectedLevels.forEach((lvlId) => {
        const level = building.levels.find((l) => l.id === lvlId);
        if (!level) return;

        const pickedFlats = Array.from(selectedFlatsByLevel[lvlId] || []);
        const flats =
          pickedFlats.length > 0
            ? level.level_orphan_flats.filter((f) => pickedFlats.includes(f.id))
            : level.level_orphan_flats;

        rows.push({
          building_id: building.id,
          building_name: building.name,
          level_id: level.id,
          level_name: level.name,
          flats: flats.map((f) => ({ flat_id: f.id, number: f.number })),
        });
      });
    });
    return rows;
  }, [
    selectedBuildings,
    buildings,
    selectedFloorsByBuilding,
    selectedFlatsByLevel,
  ]);

  // ✅ Build targets for new API
  const buildTargets = () => {
  const targets = [];

  // ✅ if any flat is explicitly selected anywhere => strict mode
  const anyFlatSelected = Object.values(selectedFlatsByLevel).some(
    (s) => s && s.size > 0
  );

  // ✅ NEW: if no floors are selected at all => tower-only targets
  const anyFloorSelected = Object.values(selectedFloorsByBuilding).some(
    (s) => s && s.size > 0
  );

  if (!anyFloorSelected && selectedBuildings.size > 0) {
    // tower-only (level_id/flat_id null)
    const seen = new Set();
    return Array.from(selectedBuildings)
      .map((bId) => ({
        building_id: Number(bId),
        level_id: null,
        flat_id: null,
      }))
      .filter((t) => {
        const k = `${t.building_id}-${t.level_id}-${t.flat_id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
  }

  // ✅ existing logic unchanged (floors/flats)
  selectedBuildings.forEach((bId) => {
    const building = buildings.find((b) => b.id === bId);
    if (!building) return;

    const levelSet = selectedFloorsByBuilding[bId];
    const levelIds = levelSet ? Array.from(levelSet) : [];

    levelIds.forEach((lvlId) => {
      const level = (building.levels || []).find((l) => l.id === lvlId);
      if (!level) return;

      const pickedSet = selectedFlatsByLevel[lvlId];
      const pickedFlatIds = pickedSet ? Array.from(pickedSet) : [];

      if (anyFlatSelected) {
        // ✅ STRICT: only explicitly chosen flats
        pickedFlatIds.forEach((flatId) => {
          targets.push({
            building_id: bId,
            level_id: lvlId,
            flat_id: flatId,
          });
        });
      } else {
        // ✅ NO flat selected: include ALL flats of selected floors
        (level.level_orphan_flats || []).forEach((f) => {
          targets.push({
            building_id: bId,
            level_id: lvlId,
            flat_id: f.id,
          });
        });
      }
    });
  });

  // ✅ de-dupe
  const seen = new Set();
  return targets.filter((t) => {
    const key = `${t.building_id}-${t.level_id}-${t.flat_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};


  const getCreatedById = () => {
    try {
      const uStr = localStorage.getItem("USER_DATA");
      const u = uStr && uStr !== "undefined" ? JSON.parse(uStr) : null;
      return Number(u?.id ?? u?.user_id ?? u?.pk) || null;
    } catch {
      return null;
    }
  };

  // ---- Submit (✅ NEW payload for checklist scheduling) ----
  const onSubmit = async () => {
    if (!projectId) return toast.error("No project selected");

if (!selectedPurposeId || !selectedPhaseId || !selectedStageId)
  return toast.error("Please select Purpose + Phase + Stage");
if (!scopeApplied) return toast.error("Please click Apply first");

    // if (!projectId) return toast.error("No project selected");
    // if (!selectedStageId) return toast.error("Please select a Stage");
    if (!startDate || !endDate)
      return toast.error("Please set Start & End dates");
    if (new Date(endDate) < new Date(startDate))
      return toast.error("End Date cannot be before Start Date");

    if (!selectedChecklistIds.length)
      return toast.error("Please select at least one Checklist");
    if (!checkerUserIds.length)
      return toast.error("Please select at least one Checker");
    const targets = buildTargets();
if (!targets.length) return toast.error("No targets selected");

// tower-only is allowed (level_id/flat_id null)
const isTowerOnlyTargets =
  targets.length > 0 &&
  targets.every((t) => t.level_id == null && t.flat_id == null);

if (!isTowerOnlyTargets && mappingsPreview.length === 0) {
  return toast.error("Please select at least one Floor (and Flats if needed)");
}


   
    const payload = {
  project_id: projectId,
  purpose_id: Number(selectedPurposeId),
  phase_id: Number(selectedPhaseId),
  stage_id: Number(selectedStageId),

  start_date: startDate,
  end_date: endDate,
  remind_before_days: Number(remindDays || 0),

  direct_to_checkers: true,
  created_by_id: getCreatedById(),

  checklist_ids: selectedChecklistIds.map(Number),
  checker_user_ids: checkerUserIds.map(Number),

  targets,
};

    try {
      await createChecklistSchedule(payload);
      toast.success("Checklist schedule created ✅");
      setOpen(false);
      resetModal();
      fetchActiveTab();
    } catch (e) {
      console.error(e);
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to create schedule"
      );
    }
  };

  // ---- UI ----
  return (
    <>
      <style>{`
        .scheduling-page input, .scheduling-page select, .scheduling-page button, .scheduling-page textarea {
          color: ${textColor};
          font-size: 14px;
        }
        .scheduling-card {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          box-shadow: 0 2px 8px ${theme === "dark" ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.06)"};
        }
        .scheduling-accent { color: ${iconColor}; }

        .scheduling-input {
          background: ${cardColor};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.35)" : "rgba(255,190,99,.3)"};
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
          padding: 10px 12px;
        }
        .scheduling-input:hover {
          border-color: ${theme === "dark" ? "rgba(255,190,99,.5)" : "rgba(255,190,99,.45)"};
        }
        .scheduling-input:focus {
          outline: none;
          border-color: ${iconColor};
          box-shadow: 0 0 0 3px ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.1)"};
        }
        .scheduling-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .scheduling-primary { 
          background: ${iconColor}; 
          color: #222; 
          font-weight: 600;
          border-radius: 8px;
          padding: 12px 24px;
          transition: all 0.2s ease;
          border: none;
        }
        .scheduling-primary:hover:not(:disabled) { 
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(255,190,99,.3);
        }
        .scheduling-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        
        .scheduling-outline { 
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.4)" : "rgba(255,190,99,.35)"}; 
          color: ${textColor}; 
          background: transparent;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .scheduling-outline:hover:not(:disabled) {
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
          border-color: ${iconColor};
        }
        .scheduling-outline:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .scheduling-table { 
          border-collapse: separate;
          border-spacing: 0;
        }
        .scheduling-table th { 
          border-bottom: 2px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"};
          padding: 12px 16px;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${theme === "dark" ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.6)"};
        }
        .scheduling-table td {
          border-bottom: 1px solid ${theme === "dark" ? "rgba(255,190,99,.12)" : "rgba(255,190,99,.1)"};
          padding: 14px 16px;
          font-size: 14px;
        }
        .scheduling-table tbody tr:hover {
          background: ${theme === "dark" ? "rgba(255,190,99,.04)" : "rgba(255,190,99,.03)"};
        }

        .scheduling-label {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
          letter-spacing: 0.3px;
        }

        .scheduling-section-title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .scheduling-shell {
          min-height: calc(100vh - 32px);
          padding: 32px 24px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .scheduling-badge {
          display: inline-block;
          background: ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          color: ${iconColor};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .scheduling-box {
          border-radius: 10px;
          padding: 12px;
          background: ${theme === "dark" ? "rgba(255,190,99,.05)" : "rgba(255,190,99,.04)"};
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          height: 340px;
          overflow-y: auto;
        }

        .scheduling-box-item {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.2)" : "rgba(255,190,99,.15)"};
          background: ${cardColor};
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .scheduling-box-item:hover {
          border-color: ${iconColor};
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
        }
        .scheduling-box-item.active {
          background: ${theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)"};
          border-color: ${iconColor};
        }

        .scheduling-tab {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid ${theme === "dark" ? "rgba(255,190,99,.3)" : "rgba(255,190,99,.25)"};
          background: transparent;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .scheduling-tab.active {
          background: ${iconColor};
          color: #222;
          border-color: ${iconColor};
        }
        .scheduling-tab:not(.active):hover {
          background: ${theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)"};
        }
      `}</style>

      <div className="scheduling-page" style={{ background: bgColor }}>
        <div className="scheduling-shell">
          {/* Header */}
          <div className="text-center max-w-6xl w-full">
            <div className="scheduling-badge mb-3">Project Management</div>
            <h1 className="text-4xl font-bold" style={{ color: textColor }}>
              Scheduling System
            </h1>
            <p
              className="mt-3 text-base"
              style={{ color: textColor, opacity: 0.7 }}
            >
              Create and manage checklist schedules with tower, floor, and flat
              assignments
            </p>
          </div>

          {/* Main Card */}
          <div className="scheduling-card rounded-xl p-8 space-y-8 max-w-6xl w-full">
            {/* Project Selection */}
            <div>
              <h2
                className="scheduling-section-title"
                style={{ color: textColor }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Project Selection
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <label
                    className="scheduling-label"
                    style={{ color: textColor }}
                  >
                    Select Project <span className="scheduling-accent">*</span>
                  </label>
                  <select
                    className="scheduling-input w-full"
                    value={projectId ?? ""}
                    onChange={(e) => setActiveProject(e.target.value)}
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setOpen(true)}
                  className="scheduling-primary mt-6"
                  disabled={!projectId || setupLoading}
                  style={{ opacity: !projectId || setupLoading ? 0.5 : 1 }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Schedule
                </button>
              </div>
            </div>

            <div
              style={{
                borderTop: `1px solid ${
                  theme === "dark"
                    ? "rgba(255,190,99,.15)"
                    : "rgba(255,190,99,.12)"
                }`,
              }}
            />

            {/* Schedules List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="scheduling-section-title"
                  style={{ color: textColor, marginBottom: 0 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Schedule Records
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTab("all")}
                    className={`scheduling-tab ${tab === "all" ? "active" : ""}`}
                  >
                    All Schedules
                  </button>
                  <button
                    onClick={() => setTab("my")}
                    className={`scheduling-tab ${tab === "my" ? "active" : ""}`}
                  >
                    My Schedules
                  </button>
                  <button
                    className="scheduling-outline"
                    onClick={fetchActiveTab}
                    disabled={listLoading}
                  >
                    {listLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              <div
                className="overflow-x-auto rounded-lg"
                style={{
                  border: `1px solid ${
                    theme === "dark"
                      ? "rgba(255,190,99,.15)"
                      : "rgba(255,190,99,.12)"
                  }`,
                }}
              >
                <table
                  className="min-w-full scheduling-table"
                  style={{ color: textColor }}
                >
                  <thead>
                    <tr className="text-left">
                      <th>Stage</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Remind</th>
                      <th>Checkers</th>
                      <th>Checklists</th>
                      <th>Targets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const data = tab === "all" ? schedulesList : myList;
                      const arr = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                        ? data.results
                        : data?.schedules || data?.items || [];

                      if (arr.length === 0) {
                        return (
                          <tr>
                            <td
                              className="text-center"
                              colSpan={7}
                              style={{ opacity: 0.6, padding: "32px" }}
                            >
                              <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                  margin: "0 auto 12px",
                                  opacity: 0.3,
                                }}
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <div>No schedules found</div>
                              <div
                                className="text-xs mt-1"
                                style={{ opacity: 0.5 }}
                              >
                                Create a new schedule to get started
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return arr.map((row, i) => {
                        const stageName =
                          row?.stage?.name ||
                          row?.stage_name ||
                          row?.stage?.label ||
                          row?.stage_id ||
                          "—";

                        const checkerCount = Array.isArray(row?.checker_user_ids)
                          ? row.checker_user_ids.length
                          : Array.isArray(row?.checkers)
                          ? row.checkers.length
                          : Array.isArray(row?.checker_users)
                          ? row.checker_users.length
                          : Array.isArray(row?.assignees) // fallback older keys
                          ? row.assignees.length
                          : "—";

                        const checklistCount = Array.isArray(row?.checklist_ids)
                          ? row.checklist_ids.length
                          : Array.isArray(row?.checklists)
                          ? row.checklists.length
                          : "—";

                        const targetsCount = Array.isArray(row?.targets)
                          ? row.targets.length
                          : Array.isArray(row?.mappings) // old key fallback
                          ? row.mappings.length
                          : "—";

                        return (
                          <tr key={row.id || i}>
                            <td>{stageName}</td>
                            <td>{row?.start_date || row?.start || "—"}</td>
                            <td>{row?.end_date || row?.end || "—"}</td>
                            <td>{row?.remind_before_days ?? "—"}</td>
                            <td>{checkerCount}</td>
                            <td>{checklistCount}</td>
                            <td>{targetsCount}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[1200]"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setOpen(false);
              resetModal();
            }}
          />

          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[95vw] max-w-7xl max-h-[90vh] rounded-xl
                 overflow-hidden"
            style={{
              background: cardColor,
              border: `1px solid ${
                theme === "dark"
                  ? "rgba(255,190,99,.25)"
                  : "rgba(255,190,99,.2)"
              }`,
              boxShadow: "0 20px 60px rgba(0,0,0,.3)",
            }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{
                borderColor:
                  theme === "dark"
                    ? "rgba(255,190,99,.15)"
                    : "rgba(255,190,99,.12)",
              }}
            >
              <div>
                <h3 className="text-xl font-semibold" style={{ color: textColor }}>
                  Create New Checklist Schedule
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: textColor, opacity: 0.6 }}
                >
                  Select stage, dates, checklists, checkers, and target flats
                </p>
              </div>
              <button
                className="scheduling-outline"
                onClick={() => {
                  setOpen(false);
                  resetModal();
                }}
              >
                <X className="w-4 h-4 inline mr-1" />
                Close
              </button>
            </div>

            <div
              className="p-6 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 140px)" }}
            >
              <div className="space-y-6">
                {/* Schedule Configuration */}
                <div>
                  <h3 className="scheduling-section-title" style={{ color: textColor }}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Schedule Configuration
                  </h3>

                  {/* ✅ changed to 6 columns */}
                  <div className="grid md:grid-cols-6 gap-4 mt-4">
                    <div>
  <label className="scheduling-label" style={{ color: textColor }}>
    Purpose <span className="scheduling-accent">*</span>
  </label>
  <select
    className="scheduling-input w-full"
    value={selectedPurposeId}
    onChange={(e) => {
      setSelectedPurposeId(e.target.value);
      setSelectedPhaseId("");
      setSelectedStageId("");
    }}
  >
    <option value="">Select Purpose</option>
    {purposeOptions.map((p) => (
   <option key={p.id} value={p.id}>
     {p.label || p.name || `Purpose #${p.id}`}
   </option>
 ))}
  </select>
</div>

<div>
  <label className="scheduling-label" style={{ color: textColor }}>
    Phase <span className="scheduling-accent">*</span>
  </label>
  <select
    className="scheduling-input w-full"
    value={selectedPhaseId}
    disabled={!selectedPurposeId}
    onChange={(e) => {
      setSelectedPhaseId(e.target.value);
      setSelectedStageId("");
    }}
  >
    <option value="">Select Phase</option>
    {phaseOptions.map((ph) => (
      <option key={ph.id} value={ph.id}>
        {ph.name}
      </option>
    ))}
  </select>
</div>

<div>
  <label className="scheduling-label" style={{ color: textColor }}>
    Stage <span className="scheduling-accent">*</span>
  </label>
  <select
    className="scheduling-input w-full"
    value={selectedStageId}
    disabled={!selectedPhaseId}
    onChange={(e) => setSelectedStageId(e.target.value)}
  >
    <option value="">Select Stage</option>
    {stageOptions.map((st) => (
      <option key={st.id} value={st.id}>
        {st.name}
      </option>
    ))}
  </select>
</div>

<div className="flex items-end">

</div>

                   

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Start Date <span className="scheduling-accent">*</span>
                      </label>
                      <input
                        type="date"
                        className="scheduling-input w-full"
                        value={startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStartDate(val);
                          if (endDate && new Date(endDate) < new Date(val)) {
                            setEndDate("");
                            setRemindDays(0);
                            toast.error("End Date cannot be before Start Date");
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        End Date <span className="scheduling-accent">*</span>
                      </label>
                      <input
                        type="date"
                        className="scheduling-input w-full"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (startDate && new Date(val) < new Date(startDate)) {
                            toast.error("End Date cannot be before Start Date");
                            return;
                          }
                          setEndDate(val);
                        }}
                      />
                    </div>

                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Remind Days Before
                        <span className="scheduling-accent ml-1">(0–{allowedRemindMax})</span>
                      </label>
                      <select
                        className="scheduling-input w-full"
                        value={String(remindDays)}
                        disabled={!startDate || !endDate}
                        onChange={(e) => setRemindDays(Number(e.target.value))}
                      >
                        {Array.from({ length: allowedRemindMax + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ✅ NEW: Checklist multi-select */}
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
  Checklists <span className="scheduling-accent">*</span>
</label>

<div className="flex items-center gap-2 mb-2">
  <button
    type="button"
    className="scheduling-outline text-xs"
    disabled={!scopeApplied || checklists.length === 0}
    onClick={() => setSelectedChecklistIds(checklists.map((c) => Number(c.id)))}
  >
    Select All
  </button>

  <button
    type="button"
    className="scheduling-outline text-xs"
    disabled={!scopeApplied || selectedChecklistIds.length === 0}
    onClick={() => setSelectedChecklistIds([])}
  >
    Clear
  </button>

  <span className="text-xs" style={{ color: textColor, opacity: 0.7 }}>
    Selected: {selectedChecklistIds.length}/{checklists.length}
  </span>
</div>

<ChecklistDropdown
  loading={checklistsLoading}
  disabled={!scopeApplied}
  items={checklists}
  value={selectedChecklistIds}
  onChange={setSelectedChecklistIds}
  theme={theme}
  cardColor={cardColor}
  textColor={textColor}
/>

                    </div>

                    {/* ✅ renamed label: Checkers */}
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Checkers <span className="scheduling-accent">*</span>
                      </label>
                     <AssigneeDropdown
  users={scopeApplied ? filteredCheckers : []}
  disabled={!scopeApplied}
  value={checkerUserIds}
  onChange={(arr) => setCheckerUserIds(arr)}
  theme={theme}
  iconColor={iconColor}
  cardColor={cardColor}
  textColor={textColor}
/>

                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${
                      theme === "dark"
                        ? "rgba(255,190,99,.15)"
                        : "rgba(255,190,99,.12)"
                    }`,
                  }}
                />

                {/* Location Selection */}
                <div>
                  <h3 className="scheduling-section-title" style={{ color: textColor }}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Location Selection
                  </h3>

                  <div className="grid md:grid-cols-4 gap-4 mt-4">
                    {/* Towers */}
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Select Tower
                      </label>
                      <div className="scheduling-box">
                        {buildings.length === 0 ? (
                          <div
                            className="text-sm text-center py-8"
                            style={{ color: textColor, opacity: 0.6 }}
                          >
                            No towers available
                          </div>
                        ) : (
                          buildings.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => toggleBuilding(b.id)}
                              className={`scheduling-box-item ${
                                selectedBuildings.has(b.id) ? "active" : ""
                              }`}
                            >
                              {b.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Floors */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          id="selectAllFloors"
                          type="checkbox"
                          className="h-4 w-4"
                          onChange={(e) =>
                            selectAllFloorsForActiveBuilding(e.target.checked)
                          }
                          disabled={!activeBuilding}
                        />
                        <label
                          htmlFor="selectAllFloors"
                          className="scheduling-label"
                          style={{ marginBottom: 0 }}
                        >
                          Select Floor
                        </label>
                      </div>
                      <div className="scheduling-box">
                        {!activeBuilding ? (
                          <div
                            className="text-sm text-center py-8"
                            style={{ color: textColor, opacity: 0.6 }}
                          >
                            Select a tower first
                          </div>
                        ) : (
                          activeFloors.map((lvl) => (
                            <button
                              key={lvl.id}
                              onClick={() => toggleLevel(activeBuilding.id, lvl.id)}
                              className={`scheduling-box-item ${
                                isLevelSelected(activeBuilding.id, lvl.id)
                                  ? "active"
                                  : ""
                              }`}
                            >
                              {lvl.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Flats */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          id="selectAllFlats"
                          type="checkbox"
                          className="h-4 w-4"
                          onChange={(e) =>
                            selectAllFlatsForActiveLevel(e.target.checked)
                          }
                          disabled={!activeLevel}
                        />
                        <label
                          htmlFor="selectAllFlats"
                          className="scheduling-label"
                          style={{ marginBottom: 0 }}
                        >
                          Select Flat
                        </label>
                      </div>
                      <div className="scheduling-box">
                        {!activeLevel ? (
                          <div
                            className="text-sm text-center py-8"
                            style={{ color: textColor, opacity: 0.6 }}
                          >
                            Select a floor first
                          </div>
                        ) : activeFlats.length === 0 ? (
                          <div
                            className="text-sm text-center py-8"
                            style={{ color: textColor, opacity: 0.6 }}
                          >
                            No flats available
                          </div>
                        ) : (
                          activeFlats.map((f) => (
                            <label
                              key={f.id}
                              className={`scheduling-box-item flex items-center gap-2 ${
                                isFlatSelected(activeLevel.id, f.id)
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isFlatSelected(activeLevel.id, f.id)}
                                onChange={() => toggleFlat(activeLevel.id, f.id)}
                              />
                              <span>{f.number}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
  <button
    type="button"
    className="scheduling-primary w-full"
    onClick={applyScopeFilters}
    disabled={
  !selectedPurposeId ||
  !selectedPhaseId ||
  !selectedStageId ||
  selectedBuildings.size === 0
}

style={{
  opacity:
    !selectedPurposeId ||
    !selectedPhaseId ||
    !selectedStageId ||
    selectedBuildings.size === 0
      ? 0.5
      : 1,
}}


    // style={{
    //   opacity:
    //     !selectedPurposeId ||
    //     !selectedPhaseId ||
    //     !selectedStageId ||
    //     mappingsPreview.length === 0
    //       ? 0.5
    //       : 1,
    // }}
  >
    Apply (Load Flat/Room Checklists)
  </button>

  <div className="text-xs mt-2" style={{ color: textColor, opacity: 0.7 }}>
    Tip: Select Purpose → Phase → Stage → Tower/Floor/Flat, then click Apply.
  </div>
</div>


                    {/* Preview */}
                    <div>
                      <label className="scheduling-label" style={{ color: textColor }}>
                        Preview
                      </label>
                      <div className="scheduling-box">
                        {mappingsPreview.length === 0 ? (
                          <div
                            className="text-sm text-center py-8"
                            style={{ color: textColor, opacity: 0.6 }}
                          >
                            Your selection will appear here
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {mappingsPreview.map((row, idx) => (
                              <div
                                key={`${row.building_id}-${row.level_id}-${idx}`}
                                className="scheduling-box-item"
                                style={{ cursor: "default" }}
                              >
                                <div className="font-semibold text-sm">
                                  {row.building_name} → {row.level_name}
                                </div>
                                <div className="text-xs mt-1" style={{ opacity: 0.7 }}>
                                  Flats:{" "}
                                  {row.flats.length > 0
                                    ? row.flats.map((f) => f.number).join(", ")
                                    : "All"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="sticky bottom-0 flex justify-end gap-3 p-6 border-t"
              style={{
                borderColor:
                  theme === "dark"
                    ? "rgba(255,190,99,.15)"
                    : "rgba(255,190,99,.12)",
                background: cardColor,
              }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  resetModal();
                }}
                className="scheduling-outline"
              >
                Cancel
              </button>
              <button onClick={onSubmit} className="scheduling-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ display: "inline", marginRight: 8 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function ChecklistDropdown({
  loading = false,
  disabled = false,
  items = [],
  value = [],
  onChange,
  theme,
  cardColor,
  textColor,
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((c) => (c.name || "").toLowerCase().includes(needle));
  }, [items, q]);

  const filteredIds = React.useMemo(
    () => filtered.map((c) => Number(c.id)).filter(Boolean),
    [filtered]
  );

  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => value.includes(Number(id)));

  const toggle = (id) => {
    const idN = Number(id);
    const has = value.includes(idN);
    if (has) onChange(value.filter((v) => v !== idN));
    else onChange([...value, idN]);
  };

  const selectAllFiltered = () => {
    if (allFilteredSelected) {
      onChange(value.filter((v) => !filteredIds.includes(Number(v))));
    } else {
      const merged = new Set([...value, ...filteredIds]);
      onChange(Array.from(merged));
    }
  };

  const clearAll = () => onChange([]);

  const summary = React.useMemo(() => {
    if (loading) return "Loading…";
    if (!value.length) return "Select checklists…";
    const names = items
      .filter((c) => value.includes(Number(c.id)))
      .map((c) => c.name);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  }, [items, value, loading]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="scheduling-input w-full text-left flex items-center justify-between"
        disabled={loading || disabled}
      >
        <span style={{ opacity: value.length ? 1 : 0.6 }}>{summary}</span>
        <svg
          className="w-4 h-4"
          style={{ opacity: 0.6 }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-[1300] mt-2 w-full rounded-lg shadow-xl"
          style={{
            background: cardColor,
            border: `1px solid ${
              theme === "dark"
                ? "rgba(255,190,99,.25)"
                : "rgba(255,190,99,.2)"
            }`,
          }}
        >
          <div
            className="p-3 border-b flex items-center gap-2"
            style={{
              borderColor:
                theme === "dark"
                  ? "rgba(255,190,99,.15)"
                  : "rgba(255,190,99,.12)",
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search checklist…"
              className="scheduling-input flex-1 text-sm"
            />
            <button
              type="button"
              onClick={selectAllFiltered}
              className="scheduling-outline text-xs px-3 py-1"
            >
              {allFilteredSelected ? "Unselect" : "All"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="scheduling-outline text-xs px-3 py-1"
            >
              Clear
            </button>
          </div>

          <div className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 && (
              <div
                className="px-4 py-3 text-sm"
                style={{ color: textColor, opacity: 0.6 }}
              >
                No matches
              </div>
            )}
            {filtered.map((c) => {
              const idN = Number(c.id);
              const checked = value.includes(idN);
              return (
                <label
                  key={idN}
                  className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer"
                  style={{
                    background: checked
                      ? theme === "dark"
                        ? "rgba(255,190,99,.08)"
                        : "rgba(255,190,99,.06)"
                      : "transparent",
                    color: textColor,
                  }}
                  onClick={() => toggle(idN)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => {}}
                  />
                  <span className="flex-1">{c.name}</span>
                </label>
              );
            })}
          </div>

          <div
            className="p-3 border-t text-xs"
            style={{
              color: textColor,
              opacity: 0.7,
              borderColor:
                theme === "dark"
                  ? "rgba(255,190,99,.15)"
                  : "rgba(255,190,99,.12)",
            }}
          >
            Selected: {value.length} / {items.length}
          </div>
        </div>
      )}
    </div>
  );
}

function AssigneeDropdown({
  users = [],
  disabled = false,
  value = [],
  onChange,
  theme,
  iconColor,
  cardColor,
  textColor,
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles.join(", ") : "";
      return (
        (u.name || "").toLowerCase().includes(needle) ||
        String(u.user_id).includes(needle) ||
        roles.toLowerCase().includes(needle)
      );
    });
  }, [users, q]);

  const filteredIds = React.useMemo(
    () => filtered.map((u) => Number(u.user_id)),
    [filtered]
  );

  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => value.includes(Number(id)));

  const toggle = (id) => {
    const idN = Number(id);
    const has = value.includes(idN);
    if (has) onChange(value.filter((v) => v !== idN));
    else onChange([...value, idN]);
  };

  const selectAllFiltered = () => {
    if (allFilteredSelected) {
      onChange(value.filter((v) => !filteredIds.includes(Number(v))));
    } else {
      const merged = new Set([...value, ...filteredIds]);
      onChange(Array.from(merged));
    }
  };

  const clearAll = () => onChange([]);

  const summary = React.useMemo(() => {
    if (!value.length) return "Select checkers…";
    const names = users
      .filter((u) => value.includes(Number(u.user_id)))
      .map((u) => u.name);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  }, [users, value]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="scheduling-input w-full text-left flex items-center justify-between"
      >
        <span style={{ opacity: value.length ? 1 : 0.6 }}>{summary}</span>
        <svg className="w-4 h-4" style={{ opacity: 0.6 }} viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-[1300] mt-2 w-full rounded-lg shadow-xl"
          style={{
            background: cardColor,
            border: `1px solid ${theme === "dark" ? "rgba(255,190,99,.25)" : "rgba(255,190,99,.2)"}`,
          }}
        >
          <div
            className="p-3 border-b flex items-center gap-2"
            style={{ borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)" }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name/role…"
              className="scheduling-input flex-1 text-sm"
            />
            <button type="button" onClick={selectAllFiltered} className="scheduling-outline text-xs px-3 py-1">
              {allFilteredSelected ? "Unselect" : "All"}
            </button>
            <button type="button" onClick={clearAll} className="scheduling-outline text-xs px-3 py-1">
              Clear
            </button>
          </div>

          <div className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm" style={{ color: textColor, opacity: 0.6 }}>
                No matches
              </div>
            )}
            {filtered.map((u) => {
              const idN = Number(u.user_id);
              const checked = value.includes(idN);
              const roles = Array.isArray(u.roles) ? u.roles.join(", ") : "";
              return (
                <label
                  key={idN}
                  className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer"
                  style={{
                    background: checked ? (theme === "dark" ? "rgba(255,190,99,.08)" : "rgba(255,190,99,.06)") : "transparent",
                    color: textColor,
                  }}
                  onClick={() => toggle(idN)}
                >
                  <input type="checkbox" className="h-4 w-4" checked={checked} onChange={() => {}} />
                  <span className="flex-1">
                    {u.name} <span style={{ opacity: 0.6 }}>{roles ? `(${roles})` : ""}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div
            className="p-3 border-t text-xs"
            style={{
              color: textColor,
              opacity: 0.7,
              borderColor: theme === "dark" ? "rgba(255,190,99,.15)" : "rgba(255,190,99,.12)",
            }}
          >
            Selected: {value.length} / {users.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduling;
