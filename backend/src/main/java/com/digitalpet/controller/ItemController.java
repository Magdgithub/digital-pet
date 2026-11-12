package com.digitalpet.controller;

import com.digitalpet.dto.ItemInfo;
import com.digitalpet.service.PetService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final PetService petService;

    public ItemController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<ItemInfo> getItems() {
        return petService.getCatalog();
    }
}
