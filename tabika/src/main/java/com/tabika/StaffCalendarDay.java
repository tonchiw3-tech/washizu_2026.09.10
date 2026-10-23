package com.tabika;
import java.time.LocalDate; import lombok.Data;
@Data public class StaffCalendarDay { private LocalDate date; private int reservationCount; private int participantCount; public StaffCalendarDay(LocalDate date,int reservationCount,int participantCount){this.date=date;this.reservationCount=reservationCount;this.participantCount=participantCount;} }
