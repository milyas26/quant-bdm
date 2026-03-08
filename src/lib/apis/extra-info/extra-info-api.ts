import { api } from "@/lib/api";
import type { ExtraInfo, CreateExtraInfoDto, UpdateExtraInfoDto } from "./interface";

export const getExtraInfos = async () => {
  const response = await api.get<ExtraInfo[]>("/extra-info");
  return response.data;
};

export const createExtraInfo = async (data: CreateExtraInfoDto) => {
  const response = await api.post<ExtraInfo>("/extra-info", data);
  return response.data;
};

export const updateExtraInfo = async (id: number, data: UpdateExtraInfoDto) => {
  const response = await api.put<ExtraInfo>(`/extra-info/${id}`, data);
  return response.data;
};

export const deleteExtraInfo = async (id: number) => {
  const response = await api.delete(`/extra-info/${id}`);
  return response.data;
};
