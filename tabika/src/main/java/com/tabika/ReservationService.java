package com.tabika;
import java.time.LocalDate; import java.util.List; import org.springframework.dao.DuplicateKeyException; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class ReservationService { private final ReservationSlotMapper slots; private final ReservationMapper reservations; public ReservationService(ReservationSlotMapper s, ReservationMapper r){slots=s;reservations=r;}
 public List<ReservationSlot> available(LocalDate date){return slots.findAvailable(date);}
 @Transactional public void reserve(Reservation r){ ReservationSlot slot=slots.findForUpdate(r.getSlotId()); if(slot==null) throw new IllegalArgumentException("予約枠がありません"); if(reservations.countByEmail(slot.getId(),r.getEmail())>0) throw new IllegalStateException("同じ予約枠への重複予約です"); if(reservations.countGuests(slot.getId())+r.getGuestCount()>slot.getCapacity()) throw new IllegalStateException("定員を超えています"); try{reservations.insert(r);}catch(DuplicateKeyException e){throw new IllegalStateException("同じ予約枠への重複予約です",e);} }
 public List<Reservation> allReservations(){return reservations.findAll();} }
