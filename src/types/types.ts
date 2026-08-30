export type OrganizationRole =
  | "admin"
  | "member" 

export type ActionPermission = 
  | "admins"
  | "members"

export type ModelTaskType =
  | "keypoints"
  | "instance segmentation"
  | "object detection"
  | "OCR"

export interface ModelConfig {
  confidence: number
  slice_height: number
  slice_width: number
  rotation?: string
  resize?: string
  custom?: Record<string, string>
  [key: string]: any
}

export interface ModelTrainingProvenance {
  trained_released?: string
  trained_by?: string
  dataset?: string
  train_images?: string
  val_images?: string
  test_images?: string
  epochs?: string
  hours?: string
  notebook?: string
  training_benchmark?: string
  [key: string]: any
}

export interface ModelMetrics {
  mAP50?: Record<string, number>
  'mAP50-95'?: Record<string, number>
  [key: string]: Record<string, number> | undefined
}

export interface ModelItem {
  id: string
  name: string
  AEC_speciality?: string
  task?: ModelTaskType
  status?: string
  model_type?: string
  version?: string
  model?: string
  provenance?: ModelTrainingProvenance
  metrics?: ModelMetrics
  drive_id?: string
  config?: ModelConfig
  defaultModel?: boolean
  [key: string]: any
}

export interface OrganizationType {
  _id: string
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  record: string
  maxBlueprints: string
  createPermission: ActionPermission
  invitePermission: ActionPermission
}

export interface CreateOrganizationPayload {
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  record: string
  maxBlueprints: number,
  adminId: string
  createPermission: ActionPermission
  invitePermission: ActionPermission
}

export interface UpdateOrganizationPayload {
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  record: string
  maxBlueprints: number
  createPermission: ActionPermission
  invitePermission: ActionPermission
}

export interface OrganizationActionPermissions {
  createPermission: ActionPermission
  invitePermission: ActionPermission
}

export interface OrganizationHomeType {
  _id: string
  name: string
  address: string
  contactEmail: string
  contactPhone: string
}

export interface OrganizationMembersList {
  _id: string
  name: string
  email: string
  picture: string
  organizationRole: OrganizationRole
}

export type OrganizationWithMembers = OrganizationType & {
  members: OrganizationMembersList[]
}

export type OrganizationWithMembersResponse = {
  list: OrganizationWithMembers[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type OrganizationMemberListResponse = {
  list: OrganizationMembersList[],
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface OrganizationUserProfile {
  organization: OrganizationType,
  role: OrganizationRole,
}

export type ProjectStatus =
  | "pending"
  | "approved"
  | "canceled"


export interface ProjectMembersList {
  _id: string
  name: string
  email: string
  picture: string
  projectRole: ProjectRole
}

export interface ProjectMemberListResponse {
  list: ProjectMembersList[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type StatusType =
  | "canceled"
  | "pending"
  | "approved"

export type ProjectRole =
  | "viewer"
  | "creator" 

export type CustomFieldType = "text" | "number" | "date";

export interface CustomField {
  name: string;
  type: CustomFieldType;
  value: string | number | Date;
}

export interface ProjectType {
  _id: string
  projectName: string
  status: StatusType
  creatorUserId: string
  organizationId: string
  customFields?: CustomField[]
  levels: string
  basement: boolean
}

export interface ProjectOrganizationType {
  _id: string
  projectName: string
  levels: string
  basement: boolean
  status: StatusType
  oldestBlueprintThumbnailUrl?: string
  customFields?: CustomField[]
}

export interface ProjectOrganizationResponse {
  list: ProjectOrganizationType[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface CreateProjectPayload {
  projectName: string
  organizationId: string
  levels: string
  basement: boolean
  customFields?: CustomField[]
}

export interface EditProjectPayload {
  projectName?: string
  status?: string
  levels?: string
  basement?: boolean
  customFields?: CustomField[]
}

export interface UserProjectListItem {
  _id: string
  projectName: string
  status: StatusType
  uploads: string
  organizationId: string
  organizationName: string
}





/* =========================================
   BLUEPRINT TYPES
========================================= */

export type SpecialtyTag =
  | 'structure'
  | 'architecture'
  | 'cold_water'
  | 'hot_water'
  | 'electrical'
  | 'gas'
  | 'sewerage'
  | 'rainwater'
  | 'notes'
  | 'tables'

export type ProjectBlueprintsFilterTypes = SpecialtyTag 
  | 'oldest_first' 
  | 'newest_first'

export type BlueprintViewType =
  | 'top'
  | 'front'
  | 'rear'
  | 'left_side'
  | 'right_side'
  | 'undefined'

// The layout detector's actual output classes (from data01.yaml) - content
// categories on a raw sheet, not viewing directions. Only 'floorplan' maps
// onto BlueprintViewType (-> 'top'); the rest don't correspond to any view.
export type LayoutFeatureClass =
  | 'detail'
  | 'floorplan'
  | 'note'
  | 'table'
  | 'titleblock'
  | 'view'
  | 'xsec'

export const layoutFeatureClassOptions: LayoutFeatureClass[] = [
  'floorplan',
  'view',
  'xsec',
  'detail',
  'titleblock',
  'table',
  'note',
]

export interface CropMadeType {
  blueprintId: string;
  blueprintName: string;
}

export const specialtyTagOptions: SpecialtyTag[] = [
  'structure',
  'architecture',
  'cold_water',
  'hot_water',
  'electrical',
  'gas',
  'sewerage',
  'rainwater',
  'notes',
  'tables',
]

export const filterMapping: Record<ProjectBlueprintsFilterTypes, true> = {
  structure: true,
  architecture: true,
  cold_water: true,
  hot_water: true,
  electrical: true,
  gas: true,
  sewerage: true,
  rainwater: true,
  notes: true,
  tables: true,
  oldest_first: true,
  newest_first: true,
}

export const projectBlueprintsFilterOptions = Object.keys(filterMapping) as ProjectBlueprintsFilterTypes[]

export const blueprintViewOptions: BlueprintViewType[] = [
  'front',
  'rear',
  'left_side',
  'right_side',
]

export interface BlueprintLevelsRangeType {
  basement: boolean,
  roof: boolean,
  bottom?: number,
  top?: number
}

export interface BlueprintResponseType {
  _id: string;
  blueprintName: string;
  filename: string;
  projectId: string;
  organizationId: string;
  storageId: string;
  storageThumbnailId: string;
  encoding: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  creationDate: string;
  specialties: SpecialtyTag[];
  levels: BlueprintLevelsRangeType[];
  view?: BlueprintViewType;
  sectionViews: SectionView[];
  detectedLayoutFeatures?: SectionView[];
  layoutClass?: LayoutFeatureClass;
  titleBlock?: string[];
  downloadUrl?: string;
  originalBlueprintId?: string;
  width?: number;
  height?: number;
  cropsMade?: CropMadeType[];
  projectFields: {
    levels: string,
    basement: boolean
  }
}

export interface BlueprintType {
  _id: string;
  blueprintName: string;
  filename: string;
  projectId: string;
  organizationId: string;
  storageId: string;
  storageThumbnailId: string;
  encoding: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  creationDate: string;
  specialties: SpecialtyTag[];
  levels: BlueprintLevelsRangeType[];
  view?: BlueprintViewType;
  sectionViews: SectionView[];
  detectedLayoutFeatures?: SectionView[];
  layoutClass?: LayoutFeatureClass;
  titleBlock?: string[];
  downloadUrl?: string;
  originalBlueprintId?: string;
  width?: number;
  height?: number;
  croppedFrom?: string;
  cropsMade?: CropMadeType[];
  scale?: number;
  scale_source?: 'ai' | 'manual';
  orientation?: number;
  orientation_source?: 'ai' | 'manual';
}

export interface CreateBlueprintPayload {
  file: File;
  blueprintName: string;
  projectId: string;
  organizationId: string;
  specialties?: SpecialtyTag[];
  levels?: BlueprintLevelsRangeType[];
  view?: BlueprintViewType;
}

export interface CreateCropPayload {
  file: File;
  blueprintName: string;
  projectId: string;
  organizationId: string;
  originalBlueprintId: string;
  width: number;
  height: number;
  view?: BlueprintViewType;
  layoutClass?: LayoutFeatureClass;
}

export interface UpdateBlueprintPayload {
  blueprintName?: string;
  cropsMade?: CropMadeType[];
  //tags
  specialties?: SpecialtyTag[];
  levels?: BlueprintLevelsRangeType[];
  view?: BlueprintViewType;
  titleBlock?: string[];
  //areas
  sectionViews?: SectionView[];
  detectedLayoutFeatures?: SectionView[];
  scale?: number;
  scale_source?: 'ai' | 'manual';
}






export type allowedTypes =
  | "image/png"
  | "image/jpeg"
  | "image/jpg"
  | "application/pdf"

export interface UserType {
  _id: string
  name: string
  email: string
  picture: string
  globalRole: string
  joinedAt: Date
  self?: true
}

export interface UserListResponse {
  list: UserType[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface InvitationPayload {
  organizationId: string
  userEmail: string
  duration?: number
  userOrganizationRole?: OrganizationRole
}

export interface InvitationItemData {
  _id: string
  organizationId: string
  organizationName: string
  userEmail: string
  sentByUserId: string
  sentByUserName: string
  creationDate: Date
  duration: number
  userOrganizationRole: OrganizationRole
  expired: boolean
}

export interface InvitationsResponse {
  list: InvitationItemData[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface SectionCoords {
  x: number,
  y: number,
}

export interface SectionSize {
  width: number,
  height: number,
}

export type SectionType = 
  | "polygon"
  | "rectangle"
  | "circle"
  | "polyline"

export interface SectionView {
  coordsList: SectionCoords[],
  size: SectionSize,
  radius?: number,
  type: SectionType,
  label?: string,
  confidence?: number,
}

export type AreaColor = {
    fill: string
    stroke: string
}

export type LabelList = {
    label: string
    count: number
}[]

export type InferenceJobStatus =
  | 'Pending'
  | 'Processing'
  | 'Processed'
  | 'Error'
  | 'Cancelled'

export interface YoloPrediction {
  class: string
  classId: number
  confidence: number
  bbox: {
    x: number      // center x in original image pixels
    y: number      // center y in original image pixels
    width: number
    height: number
  }
}

export interface ModelSummary {
  modelId: string | null
  modelName: string
  count: number
}

export interface InferenceJobResult {
  predictions?: YoloPrediction[]
  modelSummaries?: ModelSummary[]
  error?: string
}

export interface InferenceJobType {
  _id: string
  blueprintId: string
  status: InferenceJobStatus
  result: InferenceJobResult | null
  createdAt: string
  updatedAt: string
}

export interface AvailableModel {
  [speciality: string]: string[]
}



export interface MyUploadsBlurpintType {
  _id: string
  blueprintName: string
  creationDate: string
  organizationId: string
  organizationName: string
  thumbnailUrl: string
  processed: boolean
}

export interface LogField {
  key: string,
  value: string,
}

export interface RecentActivityItem {
  _id: string,
  userId: string,
  action: string,
  description: string,
  targetName: string,
  targetId: string,
  timestamp: Date,
  fields: LogField[]
}

export type Point = {
  x: number
  y: number
}

export type EditAreaState = {
  index: number | null
  area: SectionView | null
  orinigalAreaCoordsList: Point[] | null
}

export type DragAreaState = {
  areaIndex: number,
  vertexIndex?: number
  startMouse: Point
} | null