document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#top-recommendation-form");
  if (!form) return;

  const toggleFields = (radioName, expectedValue, fieldId, requiredNames) => {
    const selected = form.querySelector(`input[name="${radioName}"]:checked`);
    const container = document.querySelector(`#${fieldId}`);
    const visible = selected?.value === expectedValue;
    container.hidden = !visible;
    requiredNames.forEach((name) => {
      const input = container.querySelector(`[name="${name}"]`);
      input.required = visible;
    });
  };

  const refresh = () => {
    toggleFields("origin", "その他", "origin-other-fields", ["originOther", "originTravelMinutes"]);
    toggleFields("startMode", "specified", "start-time-field", ["startTime"]);
    toggleFields("destination", "その他", "destination-other-fields", ["destinationOther", "destinationTravelMinutes"]);
  };

  form.addEventListener("change", refresh);
  refresh();
});
