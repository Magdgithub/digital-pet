package com.digitalpet.service;

import com.digitalpet.dto.ItemInfo;
import com.digitalpet.model.Pet;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PetService {
    private final Map<Long, Pet> pets = new ConcurrentHashMap<>();
    private final AtomicLong nextId = new AtomicLong(1);

    private final Map<String, ItemInfo> catalog = Map.of(
            "food", new ItemInfo("food", "Pet food", 5, "Fills your pet's hunger."),
            "treat", new ItemInfo("treat", "Treat", 3, "A tasty snack that also makes your pet happy."),
            "toy", new ItemInfo("toy", "Toy", 8, "Play with your pet and boost happiness."));

    public List<Pet> getAllPets() {
        return List.copyOf(pets.values());
    }

    public Pet getPet(long id) {
        Pet pet = pets.get(id);
        if (pet == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found");
        return pet;
    }

    public synchronized Pet createPet(String rawName) {
        String name = rawName == null ? "" : rawName.trim();
        if (name.isBlank() || name.length() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet name must be between 1 and 30 characters");
        }
        Pet pet = new Pet(nextId.getAndIncrement(), name);
        pets.put(pet.getId(), pet);
        return pet;
    }

    public synchronized Pet feed(long id) {
        Pet pet = getPet(id);
        pet.changeHunger(-20);
        pet.changeHappiness(2);
        return pet;
    }

    public synchronized Pet play(long id) {
        Pet pet = getPet(id);
        if (pet.getEnergy() < 10) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Your pet is too tired to play. Let it sleep first.");
        }
        pet.changeHappiness(15);
        pet.changeEnergy(-10);
        pet.changeHunger(5);
        return pet;
    }

    public synchronized Pet sleep(long id) {
        Pet pet = getPet(id);
        pet.changeEnergy(30);
        pet.changeHunger(10);
        return pet;
    }

    public List<ItemInfo> getCatalog() {
        return List.copyOf(catalog.values());
    }

    public synchronized Pet useItem(long id, String itemId) {
        Pet pet = getPet(id);
        ItemInfo item = getItem(itemId);
        if (pet.itemCount(item.id()) < 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That item is not in your inventory");
        }
        if (itemId.equals("toy") && pet.getEnergy() < 10) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Your pet is too tired to play with the toy");
        }

        pet.removeItem(itemId);
        switch (itemId) {
            case "food" -> pet.changeHunger(-25);
            case "treat" -> {
                pet.changeHunger(-10);
                pet.changeHappiness(10);
            }
            case "toy" -> {
                pet.changeHappiness(20);
                pet.changeEnergy(-10);
                pet.changeHunger(5);
            }
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        }
        return pet;
    }

    public synchronized Pet purchaseItem(long id, String itemId) {
        Pet pet = getPet(id);
        ItemInfo item = getItem(itemId);
        if (pet.getCoins() < item.price()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough coins to buy this item");
        }
        pet.changeCoins(-item.price());
        pet.addItem(itemId, 1);
        return pet;
    }

    private ItemInfo getItem(String itemId) {
        ItemInfo item = catalog.get(itemId);
        if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        return item;
    }
}
