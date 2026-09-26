package com.tabika;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ModelCourse {
    private Integer id;
    private String courseName;
    private String scene;
    private String duration;
    private String departurePoint;
    private String weather;
    private String description;
    private Integer displayOrder;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
