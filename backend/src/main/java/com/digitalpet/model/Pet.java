package com.digitalpet.model;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class Pet {
    private final long id;
    private final String name;
    private int hunger;
    private int happiness;
    private int energy;
    private int coins;
    private final Map<String, Integer> inventory = new LinkedHashMap<>();

    public Pet(long id, String name) {
        this.id = id;
        this.name = name;
        this.hunger = 50;
        this.happiness = 70;
        this.energy = 80;
        this.coins = 20;
        inventory.put("food", 2);
        inventory.put("toy", 1);
        inventory.put("treat", 1);
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public int getHunger() { return hunger; }
    public int getHappiness() { return happiness; }
    public int getEnergy() { return energy; }
    public int getCoins() { return coins; }

    public Map<String, Integer> getInventory() {
        return Collections.unmodifiableMap(inventory);
    }

    public void changeHunger(int amount) { hunger = bounded(hunger + amount); }
    public void changeHappiness(int amount) { happiness = bounded(happiness + amount); }
    public void changeEnergy(int amount) { energy = bounded(energy + amount); }
    public void changeCoins(int amount) { coins = Math.max(0, coins + amount); }

    public int itemCount(String itemId) { return inventory.getOrDefault(itemId, 0); }

    public void addItem(String itemId, int amount) {
        inventory.put(itemId, itemCount(itemId) + amount);
    }

    public boolean removeItem(String itemId) {
        int count = itemCount(itemId);
        if (count < 1) return false;
        if (count == 1) inventory.remove(itemId);
        else inventory.put(itemId, count - 1);
        return true;
    }

    private static int bounded(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
