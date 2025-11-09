import { RouteEntity } from "../domain/routes";

export interface RouteRepositoryPort {
  findAll(): Promise<any[]>;
  findBaseline(): Promise<any | null>;
  setBaseline(id: string): Promise<void>;
}
