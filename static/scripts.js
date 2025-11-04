// Breed selection based on animal type
console.log("🐾 Script loaded!");

document.addEventListener("DOMContentLoaded", function () {
  console.log("🐾 DOM loaded!");

  const animalSelect = document.getElementById("animal_type");
  const breedSelect = document.getElementById("breed");

  if (!animalSelect || !breedSelect) {
    console.error("❌ Could not find animal_type or breed select elements");
    return;
  }

  console.log("✅ Found animal and breed select elements");

  animalSelect.addEventListener("change", function () {
    const animalType = this.value;
    console.log("Animal selected:", animalType);

    if (animalType) {
      breedSelect.innerHTML = '<option value="">Loading breeds...</option>';

      fetch("/get_breeds/" + animalType)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((breeds) => {
          console.log("Loaded breeds:", breeds);
          breedSelect.innerHTML = '<option value="">Select Breed</option>';
          breeds.forEach((breed) => {
            const option = document.createElement("option");
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          breedSelect.innerHTML =
            '<option value="">Error loading breeds</option>';
        });
    } else {
      breedSelect.innerHTML =
        '<option value="">First select animal type</option>';
    }
  });

  // Test: manually trigger change event for Dog
  setTimeout(() => {
    console.log("Testing auto-select...");
    animalSelect.value = "Dog";
    const event = new Event("change");
    animalSelect.dispatchEvent(event);
  }, 1000);
});
