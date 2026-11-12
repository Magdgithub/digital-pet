package com.digitalpet.controller;

import com.digitalpet.dto.CreatePetRequest;
import com.digitalpet.model.Pet;
import com.digitalpet.service.PetService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {
    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<Pet> getPets() {
        return petService.getAllPets();
    }

    @PostMapping
    public Pet createPet(@RequestBody CreatePetRequest request) {
        return petService.createPet(request.name());
    }

    @GetMapping("/{id}")
    public Pet getPet(@PathVariable long id) {
        return petService.getPet(id);
    }

    @PostMapping("/{id}/actions/feed")
    public Pet feed(@PathVariable long id) {
        return petService.feed(id);
    }

    @PostMapping("/{id}/actions/play")
    public Pet play(@PathVariable long id) {
        return petService.play(id);
    }

    @PostMapping("/{id}/actions/sleep")
    public Pet sleep(@PathVariable long id) {
        return petService.sleep(id);
    }

    @PostMapping("/{id}/inventory/{itemId}/use")
    public Pet useItem(@PathVariable long id, @PathVariable String itemId) {
        return petService.useItem(id, itemId);
    }

    @PostMapping("/{id}/inventory/{itemId}/purchase")
    public Pet purchaseItem(@PathVariable long id, @PathVariable String itemId) {
        return petService.purchaseItem(id, itemId);
    }
}
