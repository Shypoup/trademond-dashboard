import { Company, Product, Service, Category } from '@data-types/api';

/** Profile user data shape returned by the auth API */
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    phone?: string;
    jobTitle?: string;
}

/** Available tab identifiers in the Profile page */
export type TabType = 'settings' | 'companies' | 'products' | 'services';

/** Toast-style feedback message shown after actions */
export interface ProfileMessage {
    type: 'success' | 'error';
    text: string;
}

/** State controlling the entity create/edit modal */
export interface ModalState {
    isOpen: boolean;
    type: 'company' | 'product' | 'service';
    editingId?: string | number;
}

/** Settings form field values */
export interface SettingsFormData {
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
}

/** Tab descriptor used by the tab bar */
export interface TabDescriptor {
    id: TabType;
    labelKey: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

/** Common props shared by entity tab components */
export interface EntityTabProps {
    tabLoading: boolean;
    onToggleStatus: (type: 'company' | 'product' | 'service', id: string | number) => void;
    onOpenModal: (type: 'company' | 'product' | 'service', editingId?: string | number) => void;
}

/** Props for the companies tab */
export interface CompaniesTabProps extends EntityTabProps {
    companies: Company[];
    onDelete: (id: string | number) => void;
}

/** Props for the products tab */
export interface ProductsTabProps extends EntityTabProps {
    products: Product[];
    companies: Company[];
    selectedCompanyId: string | number;
    onSelectCompany: (id: string | number) => void;
    onDelete: (id: string | number) => void;
}

/** Props for the services tab */
export interface ServicesTabProps extends EntityTabProps {
    services: Service[];
    companies: Company[];
    selectedCompanyId: string | number;
    onSelectCompany: (id: string | number) => void;
    onDelete: (id: string | number) => void;
}

/** Props for the settings tab form */
export interface SettingsTabProps {
    formData: SettingsFormData;
    formSaving: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

/** Props for the profile sidebar */
export interface ProfileSidebarProps {
    user: UserProfile;
    uploading: boolean;
    itemCount: number;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onAvatarClick: () => void;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Props for the notification bar */
export interface NotificationBarProps {
    message: ProfileMessage;
    onDismiss: () => void;
}

/** Props for the entity form modal */
export interface EntityFormModalProps {
    modal: ModalState;
    companies: Company[];
    products: Product[];
    services: Service[];
    categories: Category[];
    selectedCompanyId: string | number;
    formSaving: boolean;
    onClose: () => void;
    onSubmit: (type: 'company' | 'product' | 'service', isEditing: boolean, data: Record<string, unknown>) => Promise<void>;
}
