package com.tabika;
import java.time.LocalDate; import java.time.LocalTime; import lombok.Data;
@Data public class ReservationSlot { private Long id; private LocalDate reservedDate; private LocalTime startTime; private Integer capacity; private Integer reservedCount; public int getRemaining() { return capacity - (reservedCount == null ? 0 : reservedCount); } }
