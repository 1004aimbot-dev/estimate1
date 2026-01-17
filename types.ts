export enum EstimateStatus {
    Completed = "Completed",
    Sent = "Sent",
    Draft = "Draft"
}

export interface Estimate {
    id: string;
    title: string;
    customerName: string;
    price: number;
    status: EstimateStatus;
    category: "Carpentry" | "Tile" | "General";
    imageUrl: string;
    date: string;
    author?: string; // 작성자 (상호) - 하위 호환성을 위해 유지
    
    // 공급자 정보 상세
    supplierRegNo?: string;    // 사업자 등록번호
    supplierName?: string;     // 상호
    supplierRep?: string;      // 대표자
    supplierAddress?: string;  // 사업장 주소
    
    constructionPlace?: string; // 시공 장소
    items?: EstimateItemDetail[];
    bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };
}

export interface LibraryItem {
    id: string;
    category: string;
    name: string;
    price: number;
    unit: string;
    description: string;
    isFavorite?: boolean;
}

export interface EstimateItemDetail {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    materialCost: number;
    laborCost: number;
    imageUrl?: string;
    description?: string;
}

export interface EstimateTemplate {
    id: string;
    name: string;
    description: string;
    category: string; // e.g., 'Residential', 'Commercial'
    items: Omit<EstimateItemDetail, 'id'>[]; // Items without IDs as they will be generated upon use
}