
import { Min, Max } from "class-validator"

export class validateIds {
    @Min(0)
    @Max(2147483647)
    ID_to_validate: number
  }