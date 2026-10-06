package com.tabika;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalTime;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class HomeControllerRecommendationTests {
    private final HomeController controller = new HomeController(null);

    @Test
    void doesNotRecommendWorkshopOnWeekday() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "豬・拷", "", null, LocalTime.of(10, 0), "譚ｱ莠ｬ鬧・", "", null, LocalTime.of(14, 0),
                LocalDate.of(2026, 10, 6));

        assertThat(result.workshopRecommended()).isFalse();
        assertThat(result.suggestion()).contains("土日祝日");
    }

    @Test
    void reports受付終了AfterLastGathering() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "豬・拷", "", null, LocalTime.of(15, 15), "譚ｱ莠ｬ鬧・", "", null, LocalTime.of(18, 0),
                LocalDate.of(2026, 10, 10));

        assertThat(result.workshopRecommended()).isFalse();
        assertThat(result.suggestion()).contains("受付時間は終了");
    }

    @Test
    void calculatesTokyoDomeRoundTripIncludingBothTravelLegs() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "東京ドーム", "", null, LocalTime.of(11, 0),
                "東京ドーム", "", null, LocalTime.of(17, 0));

        assertThat(result.availableMinutes()).isEqualTo(360);
        assertThat(result.requiredMinutes()).isEqualTo(130);
        assertThat(result.remainingMinutes()).isEqualTo(230);
        assertThat(result.workshopPossible()).isTrue();
    }

    @Test
    void calculatesAsakusaToTokyoStation() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "浅草", "", null, LocalTime.of(14, 0),
                "東京駅", "", null, LocalTime.of(17, 0));

        assertThat(result.requiredMinutes()).isEqualTo(100);
        assertThat(result.remainingMinutes()).isEqualTo(80);
        assertThat(result.workshopPossible()).isTrue();
    }

    @Test
    void calculatesShibuyaToTokyoDome() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "渋谷", "", null, LocalTime.of(12, 0),
                "東京ドーム", "", null, LocalTime.of(15, 0));

        assertThat(result.requiredMinutes()).isEqualTo(140);
        assertThat(result.remainingMinutes()).isEqualTo(40);
        assertThat(result.workshopPossible()).isTrue();
    }

    @Test
    void calculatesAvailableTimeAsSameDayMinutes() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "豬・拷", "", null, LocalTime.of(15, 0),
                "豬・拷", "", null, LocalTime.of(16, 0));

        assertThat(result.availableMinutes()).isEqualTo(60);
        assertThat(result.requiredMinutes()).isEqualTo(60);
        assertThat(result.remainingMinutes()).isZero();
    }

    @Test
    void calculates15_15To18_00As165MinutesOnTheSameDay() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "荳｡蝗ｽ蝗ｽ謚鬢ｨ", "", null, LocalTime.of(15, 15),
                "譚ｱ莠ｬ繝峨・繝", "", null, LocalTime.of(18, 0));

        assertThat(result.availableMinutes()).isEqualTo(165);
        assertThat(result.requiredMinutes()).isEqualTo(115);
        assertThat(result.remainingMinutes()).isEqualTo(50);
    }

    @Test
    void doesNotTurnEarlierArrivalIntoNextDay() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "豬・拷", "", null, LocalTime.of(15, 0),
                "豬・拷", "", null, LocalTime.of(14, 59));

        assertThat(result.availableMinutes()).isEqualTo(-1);
        assertThat(result.workshopPossible()).isFalse();
    }

    @Test
    void doesNotRecommendWorkshopWhenRequiredTimeExceedsAvailableTime() {
        HomeController.TopRecommendation result = controller.createTopRecommendation(
                "豬・拷", "", null, LocalTime.of(14, 0),
                "譚ｱ莠ｬ鬧・", "", null, LocalTime.of(15, 20));

        assertThat(result.requiredMinutes()).isEqualTo(100);
        assertThat(result.availableMinutes()).isEqualTo(80);
        assertThat(result.remainingMinutes()).isEqualTo(-20);
        assertThat(result.workshopPossible()).isFalse();
        assertThat(result.workshopRecommended()).isFalse();
    }
}
