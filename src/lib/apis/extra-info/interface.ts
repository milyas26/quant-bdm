export interface ExtraInfo {
  id: number;
  label: string;
  value: string;
}

export interface CreateExtraInfoDto {
  label: string;
  value: string;
}

export interface UpdateExtraInfoDto {
  label?: string;
  value?: string;
}
