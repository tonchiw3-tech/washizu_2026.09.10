package com.tabika;
import java.time.LocalDate; import java.util.List; import org.apache.ibatis.annotations.Mapper; import org.apache.ibatis.annotations.Param;
@Mapper public interface ReservationSlotMapper { List<ReservationSlot> findAvailable(@Param("date") LocalDate date); ReservationSlot findForUpdate(long id); int reservedCount(long id); }
