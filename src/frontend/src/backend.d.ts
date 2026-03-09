import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Animal {
    id: bigint;
    birthDate: string;
    removedDate?: string;
    createdAt: Time;
    number: string;
    animalType: string;
}
export type Time = bigint;
export interface backendInterface {
    addAnimal(number: string, animalType: string, birthDate: string): Promise<bigint>;
    deleteAnimal(id: bigint): Promise<void>;
    getAnimals(): Promise<Array<Animal>>;
    setRemovedDate(id: bigint, removedDate: string): Promise<void>;
    updateAnimal(id: bigint, number: string, animalType: string, birthDate: string): Promise<void>;
}
