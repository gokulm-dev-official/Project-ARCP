import api from './api';
import type { ApiResponse } from '@/types/auth';
import type { Mission, MissionRequest } from '@/types/mission';

export const missionService = {
  async startMission(data: MissionRequest): Promise<Mission> {
    const res = await api.post<ApiResponse<Mission>>('/ambulance/mission/start', data);
    return res.data.data;
  },

  async stopMission(): Promise<Mission> {
    const res = await api.post<ApiResponse<Mission>>('/ambulance/mission/stop');
    return res.data.data;
  },

  async getActiveMission(): Promise<Mission | null> {
    const res = await api.get<ApiResponse<Mission>>('/ambulance/mission/active');
    return res.data.data;
  },

  async getMissionHistory(): Promise<Mission[]> {
    const res = await api.get<ApiResponse<Mission[]>>('/ambulance/mission/history');
    return res.data.data;
  },
};
