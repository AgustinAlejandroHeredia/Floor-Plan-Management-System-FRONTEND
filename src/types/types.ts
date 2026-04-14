export type OrganizationRole =
  | "admin"
  | "member" 

export interface OrganizationType {
  _id: string
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  record: string
  maxBlueprints: string
}

export interface CreateOrganizationPayload {
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  record: string
  adminId: string
}

export interface UpdateOrganizationPayload {
  name: string
  address: string
  contactEmail: string
  contactPhone: string
  record: string
  maxBlueprints: string
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

export interface ProjectMembersList {
  _id: string
  name: string
  email: string
  picture: string
  projectRole: ProjectRole
}

export type StatusType =
  | "canceled"
  | "pending"
  | "approved"

export type ProjectRole =
  | "viewer"
  | "creator" 

export interface ProjectType {
  _id: string
  projectName: string
  record: string
  address: string
  scale: string
  others: string
  references: string
  background: string
  owner: string
  technicalDirection: string
  status: StatusType
  creatorUserId: string
  organizationId: string
}

export interface ProjectOrganizationType {
  _id: string
  projectName: string
  record: string
  address: string
  scale: string
  others: string
  references: string
  background: string
  owner: string
  technicalDirection: string
  status: StatusType
}

export interface CreateProjectPayload {
  projectName: string
  record: string
  address: string
  scale: string
  others: string
  references: string
  background: string
  owner: string
  technicalDirection: string
  organizationId: string
};

export type ProjectStatusColor =
  | "red"
  | "yellow"
  | "green" 

export interface BlueprintType {
  _id: string
  blueprintName: string
  filename: string
  projectId: string
  organizationId: string
  storageId: string
  encodign: string
  mimetype: string
  size: string
  tags: string[]
  uploadedBy: string
  creationDate: string
  downloadUrl?: string
  croppedFrom?: string
  height?: number
  width?: number
}

export interface CreateBlueprintPayload {
  file: File
  blueprintName: string
  projectId: string
  organizationId: string
  tags: string[]
}

export interface CreateCropPayload {
  file: File
  blueprintName: string
  projectId: string
  organizationId: string
  tags: string[]
  originalBlueprintId: string
  height: number
  width: number
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
  pricture: string
  globalRole: string
}