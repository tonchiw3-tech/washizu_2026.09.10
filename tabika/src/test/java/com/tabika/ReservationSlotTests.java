package com.tabika;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class ReservationSlotTests {
    @Test
    void remainingSeatsAreCapacityMinusConfirmedGuests() {
        ReservationSlot slot = new ReservationSlot();
        slot.setCapacity(5);
        slot.setReservedCount(3);
        assertEquals(2, slot.getRemaining());
    }

    @Test
    void emptyReservationCountMeansFullCapacityAvailable() {
        ReservationSlot slot = new ReservationSlot();
        slot.setCapacity(5);
        assertEquals(5, slot.getRemaining());
    }
}
