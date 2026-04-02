export interface OrganizationType {
    _id: string
    name: string
    address: string
    contactEmail: string
    contactPhone: string
    record: string
}

export interface OrganizationHomeType {
    _id: string
    name: string
    address: string
    contactEmail: string
    contactPhone: string
}

export type StatusType =
  | "canceled"
  | "pending"
  | "approved"

export type OrganizationRole =
  | "admin"
  | "member" 

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

export type ProjectStatusColor =
  | "red"
  | "yellow"
  | "green" 