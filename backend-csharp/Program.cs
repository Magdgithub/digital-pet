using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<PetStore>();
var app = builder.Build();

app.MapGet("/api/pets", (PetStore store) => Results.Ok(store.GetAll()));
app.MapPost("/api/pets", (CreatePetRequest request, PetStore store) => Run(() => store.Create(request.Name, request.Species)));
app.MapGet("/api/pets/{id:long}", (long id, PetStore store) => Run(() => store.Get(id)));
app.MapPost("/api/pets/{id:long}/actions/feed", (long id, PetStore store) => Run(() => store.Feed(id)));
app.MapPost("/api/pets/{id:long}/actions/play", (long id, PetStore store) => Run(() => store.Play(id)));
app.MapPost("/api/pets/{id:long}/actions/sleep", (long id, PetStore store) => Run(() => store.Sleep(id)));
app.MapGet("/api/items", (PetStore store) => Results.Ok(store.GetCatalog()));
app.MapPost("/api/pets/{id:long}/inventory/{itemId}/use", (long id, string itemId, PetStore store) => Run(() => store.UseItem(id, itemId)));
app.MapPost("/api/pets/{id:long}/inventory/{itemId}/purchase", (long id, string itemId, PetStore store) => Run(() => store.PurchaseItem(id, itemId)));
app.MapPut("/api/pets/{id:long}/accessory", (long id, AccessoryRequest request, PetStore store) => Run(() => store.SetAccessory(id, request.AccessoryId)));

app.Run();

static IResult Run(Func<object> action)
{
    try { return Results.Ok(action()); }
    catch (PetException exception) { return Results.Problem(statusCode: exception.StatusCode, title: exception.Message); }
}

public sealed record CreatePetRequest(string? Name, string? Species);
public sealed record AccessoryRequest(string? AccessoryId);
public sealed record ItemInfo(string Id, string Name, int Price, string Description);

public sealed class Pet
{
    public long Id { get; init; }
    public string Name { get; init; } = "";
    public string Species { get; init; } = "cat";
    public string Accessory { get; set; } = "none";
    public int Hunger { get; set; } = 50;
    public int Happiness { get; set; } = 70;
    public int Energy { get; set; } = 80;
    public int Coins { get; set; } = 20;
    public Dictionary<string, int> Inventory { get; init; } = new();

    public void ChangeHunger(int amount) => Hunger = Math.Clamp(Hunger + amount, 0, 100);
    public void ChangeHappiness(int amount) => Happiness = Math.Clamp(Happiness + amount, 0, 100);
    public void ChangeEnergy(int amount) => Energy = Math.Clamp(Energy + amount, 0, 100);
}

public sealed class PetException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed class PetStore
{
    private static readonly HashSet<string> Species = new(StringComparer.OrdinalIgnoreCase)
        { "cat", "dog", "bunny", "bear", "fox", "penguin", "frog", "panda", "turtle", "unicorn" };
    private static readonly HashSet<string> Accessories = new(StringComparer.OrdinalIgnoreCase)
        { "none", "tiara", "headband", "bow", "crown", "flower" };
    private readonly ConcurrentDictionary<long, Pet> pets = new();
    private long nextId;
    private readonly Dictionary<string, ItemInfo> catalog = new()
    {
        ["food"] = new("food", "Pet food", 5, "Fills your pet's hunger."),
        ["treat"] = new("treat", "Treat", 3, "A tasty snack that also makes your pet happy."),
        ["toy"] = new("toy", "Toy", 8, "Play with your pet and boost happiness.")
    };

    public List<Pet> GetAll() => pets.Values.OrderBy(pet => pet.Id).ToList();
    public Pet Get(long id) => pets.TryGetValue(id, out var pet) ? pet : throw new PetException(404, "Pet not found");

    public Pet Create(string? rawName, string? rawSpecies)
    {
        var name = rawName?.Trim() ?? "";
        var species = rawSpecies?.Trim().ToLowerInvariant() ?? "cat";
        if (string.IsNullOrWhiteSpace(name) || name.Length > 30)
            throw new PetException(400, "Pet name must be between 1 and 30 characters");
        if (!Species.Contains(species)) throw new PetException(400, "Choose a valid pet species");

        var pet = new Pet
        {
            Id = Interlocked.Increment(ref nextId),
            Name = name,
            Species = species,
            Inventory = new Dictionary<string, int> { ["food"] = 2, ["toy"] = 1, ["treat"] = 1 }
        };
        pets[pet.Id] = pet;
        return pet;
    }

    public Pet Feed(long id)
    {
        var pet = Get(id);
        lock (pet) { pet.ChangeHunger(-20); pet.ChangeHappiness(2); }
        return pet;
    }

    public Pet Play(long id)
    {
        var pet = Get(id);
        lock (pet)
        {
            if (pet.Energy < 10) throw new PetException(409, "Your pet is too tired to play. Let it sleep first.");
            pet.ChangeHappiness(15); pet.ChangeEnergy(-10); pet.ChangeHunger(5);
        }
        return pet;
    }

    public Pet Sleep(long id)
    {
        var pet = Get(id);
        lock (pet) { pet.ChangeEnergy(30); pet.ChangeHunger(10); }
        return pet;
    }

    public Pet SetAccessory(long id, string? rawAccessory)
    {
        var accessory = rawAccessory?.Trim().ToLowerInvariant() ?? "none";
        if (!Accessories.Contains(accessory)) throw new PetException(400, "Choose a valid accessory");
        var pet = Get(id);
        lock (pet) pet.Accessory = accessory;
        return pet;
    }

    public List<ItemInfo> GetCatalog() => catalog.Values.ToList();

    public Pet UseItem(long id, string itemId)
    {
        var pet = Get(id);
        var item = GetItem(itemId);
        lock (pet)
        {
            var count = pet.Inventory.GetValueOrDefault(item.Id);
            if (count < 1) throw new PetException(409, "That item is not in your inventory");
            if (itemId == "toy" && pet.Energy < 10) throw new PetException(409, "Your pet is too tired to play with the toy");
            if (count == 1) pet.Inventory.Remove(itemId); else pet.Inventory[itemId] = count - 1;
            switch (itemId)
            {
                case "food": pet.ChangeHunger(-25); break;
                case "treat": pet.ChangeHunger(-10); pet.ChangeHappiness(10); break;
                case "toy": pet.ChangeHappiness(20); pet.ChangeEnergy(-10); pet.ChangeHunger(5); break;
            }
        }
        return pet;
    }

    public Pet PurchaseItem(long id, string itemId)
    {
        var pet = Get(id);
        var item = GetItem(itemId);
        lock (pet)
        {
            if (pet.Coins < item.Price) throw new PetException(409, "Not enough coins to buy this item");
            pet.Coins -= item.Price;
            pet.Inventory[itemId] = pet.Inventory.GetValueOrDefault(itemId) + 1;
        }
        return pet;
    }

    private ItemInfo GetItem(string itemId) => catalog.TryGetValue(itemId, out var item) ? item : throw new PetException(404, "Item not found");
}
