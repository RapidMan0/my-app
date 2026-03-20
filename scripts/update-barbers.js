async function updateBarbersData() {
  try {
    // Получаем текущие данные
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
      {
        headers: {
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
      }
    );

    const data = await response.json();
    const barbers = data.record.barbers;

    // Добавляем reviews и averageRating к каждому барберу
    barbers.forEach(barber => {
      if (!barber.reviews) {
        barber.reviews = [];
        barber.averageRating = 0;
      }
    });

    // Обновляем данные
    const updateResponse = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
        body: JSON.stringify({ barbers }),
      }
    );

    if (updateResponse.ok) {
      console.log("Barbers data updated successfully");
    } else {
      console.error("Failed to update barbers data");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

updateBarbersData();