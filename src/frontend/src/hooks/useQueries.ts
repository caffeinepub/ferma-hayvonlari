import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Animal } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAnimals() {
  const { actor, isFetching } = useActor();
  return useQuery<Animal[]>({
    queryKey: ["animals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnimals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAnimal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      number,
      animalType,
      birthDate,
    }: {
      number: string;
      animalType: string;
      birthDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAnimal(number, animalType, birthDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
}

export function useUpdateAnimal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      number,
      animalType,
      birthDate,
    }: {
      id: bigint;
      number: string;
      animalType: string;
      birthDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateAnimal(id, number, animalType, birthDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
}

export function useSetRemovedDate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      removedDate,
    }: {
      id: bigint;
      removedDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setRemovedDate(id, removedDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
}

export function useDeleteAnimal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteAnimal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
}
