package com.tabika;
import jakarta.validation.constraints.*; import lombok.Data;
@Data public class Reservation { private Long id; private Long slotId; @NotBlank @Size(max=100) private String guestName; @NotBlank @Email @Size(max=255) private String email; @Min(1) @Max(5) private Integer guestCount; @Size(max=1000) private String note; private String status; }
