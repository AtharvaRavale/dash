import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    id: null,
    user_id: null,
    username: null,
    first_name: null,
    last_name: null,
    email: null,
    phone_number: null,
    date_joined: null,
    last_login: null,
    has_access: false,
    is_client: false,
    superadmin: false,
  },
  organization: {
    id: null,
  },
  company: {
    id: null,
  },
  selectedProject: {
    id: null,
  },
  projects: [],
  purposes: {},
  phases: {},
  stages: {},
  tower: {},
  selectedTowerId: null,
  levels: {},
  rooms: [],
  flatTypes: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log(action, "action");
      // If action.payload is just an ID (for backward compatibility)
      if (
        typeof action.payload === "number" ||
        typeof action.payload === "string"
      ) {
        state.user.id = action.payload;
      } else {
        // If action.payload is the full user object
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Add a new action specifically for setting full user data
    setUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setOrganization: (state, action) => {
      if (!state.organization) {
        state.organization = {};
      }
      state.organization.id = action.payload;
    },
    setCompany: (state, action) => {
      if (!state.company) {
        state.company = {};
      }
      console.log(action.payload, "action.payload id");
      state.company.id = action.payload;
    },
    setSelectedProject: (state, action) => {
      if (!state.selectedProject) {
        state.selectedProject = {};
      }
      state.selectedProject.id = action.payload;
    },
    setProjects: (state, action) => {
      if (!state.projects) {
        state.projects = [];
      }
      console.log(action.payload, "action.payload projects");
      if (action.payload === null) {
        state.projects = [];
      } else {
        state.projects = [...action.payload];
      }
    },
    setPurposes: (state, action) => {
      if (!state.purposes) {
        state.purposes = {};
      }
      console.log(action.payload, "action.payload purposes");
      state.purposes[action.payload.project_id] = action.payload.data;
    },
    setPhases: (state, action) => {
      if (!state.phases) {
        state.phases = {};
      }
      state.phases[action.payload.project_id] = action.payload.data;
    },
    setStages: (state, action) => {
      if (!state.stages) {
        state.stages = {};
      }
      state.stages[action.payload.project_id] = action.payload.data;
    },
    setTower: (state, action) => {
      if (!state.tower) {
        state.tower = {};
      }
      state.tower[action.payload.project_id] = action.payload.data;
    },
    setSelectedTowerId: (state, action) => {
      if (!state.selectedTowerId) {
        state.selectedTowerId = null;
      }
      state.selectedTowerId = action.payload;
    },
    setLevels: (state, action) => {
      if (!state.levels) {
        state.levels = {};
      }
      state.levels[action.payload.project_id] = action.payload.data;
    },
    setRoomTypes: (state, action) => {
      console.log(action.payload, "action.payload rooms");
      if (!state.rooms) {
        state.rooms = [];
      }
      state.rooms = [...action.payload];
    },
    setFlatTypes: (state, action) => {
      if (!state.flatTypes) {
        state.flatTypes = {};
      }
      state.flatTypes[action.payload.project_id] = action.payload.data;
    },
  },
});

export const {
  setUser,
  setUserData,
  setOrganization,
  setCompany,
  setProjects,
  setSelectedProject,
  setPurposes,
  setPhases,
  setStages,
  setTower,
  setSelectedTowerId,
  setLevels,
  setRoomTypes,
  setFlatTypes,
} = userSlice.actions;
export default userSlice.reducer;
