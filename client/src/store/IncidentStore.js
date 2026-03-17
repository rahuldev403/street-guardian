import { create } from "zustand";
import { api } from "../lib/api";

export const useIncidentStore = create((set, get) => ({
  incidents: [],
  pagination: null,
  isLoading: false,
  error: null,
  newCount: 0,
  filters: { severity: "", type: "", sortBy: "" },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      newCount: 0,
    }));
  },

  fetchIncidents: async (page = 1, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = { page, limit: 12 };
      if (filters.severity) params.severity = filters.severity;
      if (filters.type) params.type = filters.type;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const res = await api.get("/incidents", { params });
      const data = res.data.data;

      set((state) => ({
        incidents: append
          ? [...state.incidents, ...data.incidents]
          : data.incidents,
        pagination: data.pagination,
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || "Failed to load incidents",
      });
    }
  },

  upvoteIncident: async (id) => {
    try {
      const res = await api.patch(`/incidents/${id}/upvote`);
      const updated = res.data.data;
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc._id === id ? updated : inc,
        ),
      }));
    } catch (err) {
      console.error("Upvote failed", err);
    }
  },

  prependIncident: (incident) => {
    set((state) => ({
      incidents: [incident, ...state.incidents],
      newCount: state.newCount + 1,
    }));
  },

  clearNewCount: () => set({ newCount: 0 }),

  reset: () =>
    set({
      incidents: [],
      pagination: null,
      isLoading: false,
      error: null,
      newCount: 0,
      filters: { severity: "", type: "", sortBy: "" },
    }),
}));
