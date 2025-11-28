// types/materials-filters.ts
import { Classification } from "@/types/material-passport";

export type SortOption =
    | 'CARBON_ASC'
    | 'CARBON_DESC'
    | 'PRICE_ASC'
    | 'PRICE_DESC'
    | 'DISTANCE_ASC'
    | 'VOLUME_DESC'
    | 'VOLUME_ASC'
    | 'AGE_DESC' | 'AGE_ASC'
    | 'CIRCULARITY_DESC'
    | 'THERMAL_ASC'


export type DisplayMode = 'card' | 'thumbnail';

export type DashboardViewMode = 'BANK' | 'PLANNING';

export interface MaterialFilterState {
    search: string;
    classification: string[]
    endOfLife: string[]
    health: 'ALL' | 'Red_List_Free' | 'Contains_VOCs';
    sort: SortOption;
    mode: DisplayMode;
    origin: 'ALL' | 'NEW' | 'EXISTING';
    usage: 'ALL' | 'USED';
    onlyLocal: boolean
}