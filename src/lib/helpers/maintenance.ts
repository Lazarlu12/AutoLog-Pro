import type { CreateMaintenanceInput } from "@/lib/validations/maintenance"
import type { MaintenanceType } from "@prisma/client"

export function parseMaintenanceForm(form: HTMLFormElement | FormData): CreateMaintenanceInput {
  const fd = form instanceof FormData ? form : new FormData(form)

  const get = (k: string) => {
    const v = fd.get(k)
    return v === null ? "" : String(v)
  }

  const type = fd.get("type") as MaintenanceType

  const serviceDateStr = get("serviceDate")
  const serviceDate = serviceDateStr ? new Date(serviceDateStr) : (undefined as unknown as Date)

  const mileage = Number(get("mileage") || 0)

  const costStr = get("cost")
  const cost = costStr ? Number(costStr) : undefined

  const provider = get("provider") || undefined
  const notes = get("notes") || undefined

  const nextDueDateStr = get("nextDueDate")
  const nextDueDate = nextDueDateStr ? new Date(nextDueDateStr) : undefined

  const nextDueMileageStr = get("nextDueMileage")
  const nextDueMileage = nextDueMileageStr ? Number(nextDueMileageStr) : undefined

  return {
    type,
    serviceDate,
    mileage,
    cost,
    provider,
    notes,
    nextDueDate,
    nextDueMileage,
  }
}
