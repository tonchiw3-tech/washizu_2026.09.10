package com.tabika;
import java.time.LocalDate; import java.time.LocalTime; import lombok.Data;
@Data public class StaffReservation { private Long id; private LocalDate reservedDate; private LocalTime startTime; private String guestName; private String email; private Integer guestCount; private String note; private String status; }
