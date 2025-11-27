// types/materials-filters.ts
import { Classification } from "@/types/material-passport";

export type SortOption =
    | 'CARBON_ASC'
    | 'CARBON_DESC'
    | 'PRICE_ASC'
    | 'PRICE_DESC'
    | 'DISTANCE_ASC'
    | 'VOLUME_DESC'
    | 'VOLUME_ASC';


export type DisplayMode = 'card' | 'thumbnail'; // NEW

export interface MaterialFilterState {
    search: string;
    classification: Classification | 'ALL';
    health: 'ALL' | 'Red_List_Free' | 'Contains_VOCs';
    sort: SortOption;
    mode: DisplayMode; // NEW
    origin: 'ALL' | 'NEW' | 'EXISTING';
    usage: 'ALL' | 'USED';
}