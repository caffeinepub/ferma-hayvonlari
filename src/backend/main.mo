import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";

actor {
  module Types {
    public type Animal = {
      id : Nat;
      number : Text;
      animalType : Text;
      birthDate : Text;
      removedDate : ?Text;
      createdAt : Time.Time;
    };
  };

  module Animal {
    public func compare(a1 : Types.Animal, a2 : Types.Animal) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  var nextId = 1;
  let animals = Map.empty<Nat, Types.Animal>();

  public shared ({ caller }) func addAnimal(number : Text, animalType : Text, birthDate : Text) : async Nat {
    let id = nextId;
    nextId += 1;

    let animal : Types.Animal = {
      id;
      number;
      animalType;
      birthDate;
      removedDate = null;
      createdAt = Time.now();
    };

    animals.add(id, animal);
    id;
  };

  public query ({ caller }) func getAnimals() : async [Types.Animal] {
    animals.values().toArray().sort();
  };

  public shared ({ caller }) func updateAnimal(id : Nat, number : Text, animalType : Text, birthDate : Text) : async () {
    switch (animals.get(id)) {
      case (null) { Runtime.trap("Animal not found") };
      case (?existing) {
        let updatedAnimal : Types.Animal = {
          id;
          number;
          animalType;
          birthDate;
          removedDate = existing.removedDate;
          createdAt = existing.createdAt;
        };
        animals.add(id, updatedAnimal);
      };
    };
  };

  public shared ({ caller }) func setRemovedDate(id : Nat, removedDate : Text) : async () {
    switch (animals.get(id)) {
      case (null) { Runtime.trap("Animal not found") };
      case (?existing) {
        let updatedAnimal : Types.Animal = {
          id;
          number = existing.number;
          animalType = existing.animalType;
          birthDate = existing.birthDate;
          removedDate = ?removedDate;
          createdAt = existing.createdAt;
        };
        animals.add(id, updatedAnimal);
      };
    };
  };

  public shared ({ caller }) func deleteAnimal(id : Nat) : async () {
    if (not animals.containsKey(id)) {
      Runtime.trap("Animal not found");
    };
    animals.remove(id);
  };
};
