package com.tabika;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class HomeControllerRecommendationTests {
    private final HomeController controller = new HomeController(null);

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
}
