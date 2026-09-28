document.addEventListener("DOMContentLoaded", () => {
  const destination = document.querySelector("#destination");
  const choices = {
    train: ["東京駅", "上野駅", "その他"],
    flight: ["羽田空港", "その他"],
    event: ["東京ドーム", "両国国技館", "日本武道館", "東京国際フォーラム", "その他"],
    other: ["その他"]
  };

  document.querySelectorAll('input[name="nextPlan"]').forEach((input) => {
    input.addEventListener("change", () => {
      destination.replaceChildren(new Option("選択してください", ""));
      choices[input.value].forEach((name) => destination.add(new Option(name, name)));
      destination.disabled = false;
      destination.focus();
    });
  });
});
