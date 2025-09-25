import { create } from 'zustand';
import { OptimizationRun, Decision, DecisionSnapshot } from '../types';

interface InductionState {
  currentRun: OptimizationRun | null;
  decisions: Decision[];
  published: boolean;
  snapshots: DecisionSnapshot[];
  setCurrentRun: (run: OptimizationRun) => void;
  addDecision: (decision: Decision) => void;
  updateDecision: (trainId: string, decision: Partial<Decision>) => void;
  removeDecision: (trainId: string) => void;
  clearDecisions: () => void;
  setPublished: (published: boolean) => void;
  addSnapshot: (snapshot: DecisionSnapshot) => void;
  setSnapshots: (snapshots: DecisionSnapshot[]) => void;
}

export const useInductionStore = create<InductionState>((set, get) => ({
  currentRun: null,
  decisions: [],
  published: false,
  snapshots: [],
  setCurrentRun: (run: OptimizationRun) => set({ currentRun: run }),
  addDecision: (decision: Decision) =>
    set((state) => ({
      decisions: [
        ...state.decisions.filter((d) => d.id !== decision.id),
        decision,
      ],
    })),
  updateDecision: (trainId: string, decision: Partial<Decision>) =>
    set((state) => ({
      decisions: state.decisions.map((d) =>
        d.id === trainId ? { ...d, ...decision } : d
      ),
    })),
  removeDecision: (trainId: string) =>
    set((state) => ({
      decisions: state.decisions.filter((d) => d.id !== trainId),
    })),
  clearDecisions: () => set({ decisions: [] }),
  setPublished: (published: boolean) => set({ published }),
  addSnapshot: (snapshot: DecisionSnapshot) =>
    set((state) => ({
      snapshots: [snapshot, ...state.snapshots],
    })),
  setSnapshots: (snapshots: DecisionSnapshot[]) => set({ snapshots }),
}));
