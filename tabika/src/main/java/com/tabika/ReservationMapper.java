package com.tabika;
import java.time.LocalDate; import java.util.List; import org.apache.ibatis.annotations.Mapper; import org.apache.ibatis.annotations.Param;
@Mapper public interface ReservationMapper { int countGuests(long slotId); int countByEmail(@Param("slotId") long slotId,@Param("email") String email); int insert(Reservation reservation); List<Reservation> findAll(); List<StaffReservation> findStaffCalendar(); List<StaffReservation> findStaffReservationsByDate(@Param("date") LocalDate date); }
