import { create } from 'zustand';

interface InstanceState {
  instances: any[];
  loading: boolean;
  error: string | null;
  fetchInstances: () => Promise<void>;
  addInstance: (instance: any) => void;
  removeInstance: (id: string) => void;
}

export const useInstanceStore = create<InstanceState>((set, get) => ({
  instances: [],
  loading: false,
  error: null,

  fetchInstances: async () => {
    set({ loading: true, error: null });
    try {
      // const response = await api.get('/instances');
      // set({ instances: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addInstance: (instance) => {
    const { instances } = get();
    set({ instances: [...instances, instance] });
  },

  removeInstance: (id) => {
    const { instances } = get();
    set({ instances: instances.filter((i: any) => i.id !== id) });
  },
}));
