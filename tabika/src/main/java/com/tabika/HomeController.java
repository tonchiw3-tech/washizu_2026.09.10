package com.tabika;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {
    private static final ZoneId JAPAN_ZONE = ZoneId.of("Asia/Tokyo");
    private static final int WORKSHOP_MINUTES = 60;
    private static final List<WorkshopSlot> WORKSHOP_SLOTS = List.of(
            new WorkshopSlot(LocalTime.of(10, 50), LocalTime.of(11, 0), LocalTime.of(12, 0)),
            new WorkshopSlot(LocalTime.of(12, 50), LocalTime.of(13, 0), LocalTime.of(14, 0)),
            new WorkshopSlot(LocalTime.of(14, 50), LocalTime.of(15, 0), LocalTime.of(16, 0)));
    private final ModelCourseMapper modelCourseMapper;

    public HomeController(ModelCourseMapper modelCourseMapper) {
        this.modelCourseMapper = modelCourseMapper;
    }

    @GetMapping("/")
    public String home() { return "index"; }

    @PostMapping("/top-recommendation")
    public String topRecommendation(
            @RequestParam String origin,
            @RequestParam(required = false, defaultValue = "") String originOther,
            @RequestParam(required = false) Integer originTravelMinutes,
            @RequestParam String startMode,
            @RequestParam(required = false) LocalTime startTime,
            @RequestParam String destination,
            @RequestParam(required = false, defaultValue = "") String destinationOther,
            @RequestParam(required = false) Integer destinationTravelMinutes,
            @RequestParam LocalTime arrivalTime,
            Model model) {
        LocalTime effectiveStart = "now".equals(startMode)
                ? LocalTime.now(JAPAN_ZONE).withSecond(0).withNano(0)
                : startTime;
        String validationError = validateTopRecommendation(origin, originOther, originTravelMinutes,
                effectiveStart, destination, destinationOther, destinationTravelMinutes);
        if (validationError != null) {
            model.addAttribute("formError", validationError);
        } else {
            model.addAttribute("topPlan", createTopRecommendation(origin, originOther,
                    originTravelMinutes, effectiveStart, destination, destinationOther,
                    destinationTravelMinutes, arrivalTime));
        }
        model.addAttribute("submittedOrigin", origin);
        model.addAttribute("submittedOriginOther", originOther);
        model.addAttribute("submittedOriginTravelMinutes", originTravelMinutes);
        model.addAttribute("submittedStartMode", startMode);
        model.addAttribute("submittedStartTime", startTime);
        model.addAttribute("submittedDestination", destination);
        model.addAttribute("submittedDestinationOther", destinationOther);
        model.addAttribute("submittedDestinationTravelMinutes", destinationTravelMinutes);
        model.addAttribute("submittedArrivalTime", arrivalTime);
        return "index";
    }

    private String validateTopRecommendation(String origin, String originOther, Integer originTravelMinutes,
            LocalTime startTime, String destination, String destinationOther, Integer destinationTravelMinutes) {
        if (startTime == null) return "開始時刻を入力してください。";
        if ("その他".equals(origin) && originOther.isBlank()) return "現在地を入力してください。";
        if ("その他".equals(origin) && originTravelMinutes == null) {
            return "現在地からinimuまでの移動時間を入力してください。";
        }
        if ("その他".equals(destination) && destinationOther.isBlank()) return "到着したい場所を入力してください。";
        if ("その他".equals(destination) && destinationTravelMinutes == null) {
            return "inimuから目的地までの移動時間を入力してください。";
        }
        return null;
    }

    @GetMapping("/courses")
    public String courses(Model model) {
        model.addAttribute("courses", allCourses());
        return "model-courses";
    }

    @GetMapping("/courses/{id}")
    public String courseDetail(@PathVariable int id, Model model) {
        ModelCourse course = modelCourseMapper.findById(id);
        if (course == null) {
            course = builtInCourses().stream().filter(item -> item.getId() == id).findFirst().orElse(null);
        }
        if (course == null) return "redirect:/courses";
        model.addAttribute("course", course);
        model.addAttribute("schedule", scheduleFor(course));
        return "course-detail";
    }

    private Recommendation createRecommendation(String nextPlan, String destination, LocalTime arrivalTime) {
        LocalDateTime now = LocalDateTime.now(JAPAN_ZONE).withSecond(0).withNano(0);
        LocalDateTime arrival = now.with(arrivalTime);
        if (!arrival.isAfter(now)) arrival = arrival.plusDays(1);

        int travelBuffer = travelBufferMinutes(destination);
        int totalMinutes = (int) Duration.between(now, arrival).toMinutes();
        int activityMinutes = totalMinutes - travelBuffer;
        String arrivalText = arrivalTime.format(DateTimeFormatter.ofPattern("HH:mm"));
        String label = planLabel(nextPlan);

        if (activityMinutes < WORKSHOP_MINUTES) {
            String message = "到着希望時刻までの残り時間では、約60分の体験と移動時間を無理なく確保できません。今回は"
                    + destination + "への移動を優先してください。";
            return new Recommendation(label, destination, arrivalText, travelBuffer, false, message, List.of());
        }

        LocalDateTime departure = arrival.minusMinutes(travelBuffer);
        LocalDateTime workshopStart;
        List<RecommendationStep> steps;
        if (activityMinutes >= 120) {
            int optionalMinutes = Math.min(60, activityMinutes - WORKSHOP_MINUTES);
            workshopStart = departure.minusMinutes(WORKSHOP_MINUTES);
            steps = List.of(
                    step(now, "時間に余裕があれば、浅草散策・休憩", "混雑時は無理をせず、香りづくり体験を優先します（最大約" + optionalMinutes + "分）。"),
                    step(workshopStart, "inimuで香りづくり体験 約60分", "浅草での思い出を香りにします。"),
                    step(departure, destination + "へ移動", "移動と到着前の余裕時間を確保しています。"));
        } else {
            workshopStart = now;
            steps = List.of(
                    step(workshopStart, "inimuで香りづくり体験 約60分", "浅草到着後、最初に体験する流れです。"),
                    step(departure, destination + "へ移動", "散策やカフェは加えず、次の予定を最優先にします。"));
        }

        String message = activityMinutes >= 120
                ? "香りづくり体験を中心に、時間に余裕があれば浅草散策や休憩も楽しめます。"
                : "限られた時間のため、香りづくり体験のあと、そのまま次の目的地へ向かうプランです。";
        return new Recommendation(label, destination, arrivalText, travelBuffer, true, message, steps);
    }

    TopRecommendation createTopRecommendation(String origin, String originOther, Integer originTravelMinutes,
            LocalTime startTime, String destination, String destinationOther, Integer destinationTravelMinutes,
            LocalTime arrivalTime) {
        int toInimuMinutes = "その他".equals(origin)
                ? positiveMinutes(originTravelMinutes)
                : originToInimuMinutes(origin);
        int fromInimuMinutes = "その他".equals(destination)
                ? positiveMinutes(destinationTravelMinutes)
                : inimuToDestinationMinutes(destination);
        // The form represents JST clock times on the same day. Build both
        // values on one fixed local date so no date rollover or UTC
        // conversion can add an unintended 24-hour offset.
        int availableMinutes = sameDayMinutesBetween(startTime, arrivalTime);
        int requiredMinutes = toInimuMinutes + WORKSHOP_MINUTES + fromInimuMinutes;
        int remainingMinutes = availableMinutes - requiredMinutes;
        boolean possible = remainingMinutes >= 0;
        int freeTimeMinutes = availableMinutes - toInimuMinutes - fromInimuMinutes;
        WorkshopMatch workshop = findNextWorkshop(startTime, arrivalTime, toInimuMinutes, fromInimuMinutes);
        boolean workshopRecommended = workshop != null;
        boolean extendedPlan = freeTimeMinutes >= 180;
        boolean halfDayPlan = freeTimeMinutes >= 240;
        boolean oneDayPlan = freeTimeMinutes >= 360;

        String suggestion;
        if (remainingMinutes < 0) {
            suggestion = "次の目的地への移動を優先するプラン";
        } else if (oneDayPlan) {
            suggestion = "浅草観光・食事・香り体験を組み合わせ、体験後は4つのテーマから過ごし方を選ぶ1日プラン";
        } else if (halfDayPlan) {
            suggestion = "浅草観光・街歩きと香り体験を組み合わせる半日プラン";
        } else if (extendedPlan) {
            suggestion = "香り体験の前後に浅草散策や休憩を組み合わせるプラン";
        } else if (remainingMinutes < 30) {
            suggestion = "香りづくり体験後、そのまま次の目的地へ向かうプラン";
        } else if (remainingMinutes < 60) {
            suggestion = "香りづくり体験後、余裕をもって次の目的地へ向かうプラン";
        } else {
            suggestion = "香りづくり体験後、余裕をもって次の目的地へ向かうプラン";
        }

        String originLabel = "その他".equals(origin) && !originOther.isBlank() ? originOther : origin;
        String destinationLabel = "その他".equals(destination) && !destinationOther.isBlank()
                ? destinationOther : destination;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return new TopRecommendation(originLabel, destinationLabel, startTime.format(formatter),
                arrivalTime.format(formatter), toInimuMinutes, fromInimuMinutes, availableMinutes,
                requiredMinutes, remainingMinutes, possible, workshopRecommended, extendedPlan,
                halfDayPlan, oneDayPlan, suggestion,
                workshop == null ? "" : workshop.gatherTime().format(formatter),
                workshop == null ? "" : workshop.experienceStart().format(formatter) + "〜"
                        + workshop.experienceEnd().format(formatter),
                workshop == null ? 0 : toInimuMinutes,
                workshop == null ? 0 : (int) Duration.between(workshop.experienceEnd(), arrivalTime).toMinutes());
    }

    private int sameDayMinutesBetween(LocalTime startTime, LocalTime endTime) {
        LocalDate sameDay = LocalDate.of(2000, 1, 1);
        return (int) Duration.between(sameDay.atTime(startTime), sameDay.atTime(endTime)).toMinutes();
    }

    private WorkshopMatch findNextWorkshop(LocalTime start, LocalTime arrival, int toInimu, int fromInimu) {
        return WORKSHOP_SLOTS.stream()
                .filter(slot -> !slot.gatherTime().isBefore(start.plusMinutes(toInimu)))
                .filter(slot -> !slot.experienceEnd().plusMinutes(fromInimu).isAfter(arrival))
                .findFirst()
                .map(slot -> new WorkshopMatch(slot.gatherTime(), slot.experienceStart(), slot.experienceEnd()))
                .orElse(null);
    }

    private int positiveMinutes(Integer minutes) {
        return minutes == null ? 0 : Math.max(0, minutes);
    }

    private int originToInimuMinutes(String origin) {
        return switch (origin) {
            case "浅草" -> 10;
            case "上野" -> 20;
            case "東京駅" -> 30;
            case "新宿" -> 40;
            case "渋谷" -> 45;
            case "東京ドーム" -> 35;
            case "両国国技館" -> 20;
            case "日本武道館" -> 35;
            default -> 0;
        };
    }

    private int inimuToDestinationMinutes(String destination) {
        return switch (destination) {
            case "東京駅" -> 30;
            case "東京ドーム" -> 35;
            case "両国国技館" -> 20;
            case "日本武道館" -> 35;
            case "羽田空港" -> 60;
            default -> 0;
        };
    }

    private RecommendationStep step(LocalDateTime time, String activity, String note) {
        return new RecommendationStep(time.format(DateTimeFormatter.ofPattern("HH:mm")), activity, note);
    }

    private int travelBufferMinutes(String destination) {
        return switch (destination) {
            case "上野駅" -> 45;
            case "東京駅", "東京国際フォーラム" -> 60;
            case "両国国技館" -> 45;
            case "東京ドーム", "日本武道館" -> 75;
            case "羽田空港" -> 120;
            default -> 60;
        };
    }

    private String planLabel(String nextPlan) {
        return switch (nextPlan) {
            case "train" -> "新幹線";
            case "flight" -> "飛行機";
            case "event" -> "イベント";
            default -> "次の予定";
        };
    }

    private List<ModelCourse> allCourses() {
        List<ModelCourse> stored = modelCourseMapper.findAll();
        return Stream.concat(stored.stream(), builtInCourses().stream()
                        .filter(item -> stored.stream().noneMatch(saved -> saved.getCourseName().equals(item.getCourseName()))))
                .toList();
    }

    private List<ModelCourse> builtInCourses() {
        return List.of(
                course(-1, "浅草を楽しむ2時間コース", "短い自由時間に", "2時間", "予定に合わせて", "浅草散策と香りづくりをコンパクトに楽しむコースです。"),
                course(-2, "イベント前の3時間コース", "イベント開始まで", "3時間", "イベント会場", "浅草で過ごしたあと、余裕を持って会場へ向かうコースです。"),
                course(-3, "帰りの新幹線まで楽しむ3時間コース", "チェックアウト後に", "3時間", "東京駅", "旅の最後に浅草散策と香りづくりを楽しむコースです。"),
                course(-4, "羽田空港へ向かう前の半日コース", "フライトまでの時間に", "半日", "羽田空港", "浅草で半日を楽しみ、移動時間を確保して空港へ向かいます。"),
                course(-5, "1日楽しむ街道歩き・歴史散策コース", "1日の自由時間に", "1日", "予定に合わせて", "東京・浅草の歴史をたどり、最後に香りの思い出を作るコースです。"),
                course(-6, "雨の日でも楽しめる室内中心の過ごし方", "急な雨・予定変更に", "2時間", "予定に合わせて", "室内を中心に、雨の日の浅草と香りづくりを楽しむコースです。"),
                course(-7, "香りづくり約60分のひと休みプラン", "東京観光の合間に", "約60分", "予定に合わせて", "歩き疲れた旅の途中にひと息つき、自分のペースで香りづくりを楽しむプランです。"));
    }

    private ModelCourse course(int id, String name, String scene, String duration, String destination, String description) {
        ModelCourse course = new ModelCourse();
        course.setId(id); course.setCourseName(name); course.setScene(scene); course.setDuration(duration);
        course.setDeparturePoint(destination); course.setDescription(description); course.setIsPublished(true);
        return course;
    }

    private List<CourseStep> scheduleFor(ModelCourse course) {
        String text = (course.getCourseName() == null ? "" : course.getCourseName())
                + (course.getDuration() == null ? "" : course.getDuration());
        if (text.contains("1日")) {
            return List.of(new CourseStep("午前", "街道歩き・歴史散策"), new CourseStep("昼", "浅草でランチ"),
                    new CourseStep("午後", "浅草散策"), new CourseStep("最後", "inimuで香りづくり体験"));
        }
        if (text.contains("新幹線") || text.contains("東京駅")) {
            return List.of(new CourseStep("11:00", "ホテルをチェックアウト"), new CourseStep("11:30", "浅草へ移動・散策"),
                    new CourseStep("12:00", "浅草でランチ"), new CourseStep("13:00", "inimuで香りづくり体験"),
                    new CourseStep("14:00", "東京駅へ移動"), new CourseStep("15:00", "東京駅到着"));
        }
        return List.of(new CourseStep("スタート", "浅草周辺を散策"), new CourseStep("途中", "休憩・カフェ"),
                new CourseStep("体験", "inimuで香りづくり体験"), new CourseStep("最後", "次の目的地へ移動"));
    }

    public record Recommendation(String planLabel, String destination, String arrivalTime,
            int travelBufferMinutes, boolean workshopPossible, String message, List<RecommendationStep> steps) {}
    public record TopRecommendation(String origin, String destination, String startTime, String arrivalTime,
            int toInimuMinutes, int fromInimuMinutes, int availableMinutes, int requiredMinutes,
            int remainingMinutes, boolean workshopPossible, boolean workshopRecommended,
            boolean extendedPlan, boolean halfDayPlan, boolean oneDayPlan, String suggestion,
            String workshopGatherTime, String workshopExperienceTime, int workshopTravelMinutes,
            int workshopRemainingMinutes) {}
    public record WorkshopSlot(LocalTime gatherTime, LocalTime experienceStart, LocalTime experienceEnd) {}
    private record WorkshopMatch(LocalTime gatherTime, LocalTime experienceStart, LocalTime experienceEnd) {}
    public record RecommendationStep(String time, String activity, String note) {}
    public record CourseStep(String time, String activity) {}
}
