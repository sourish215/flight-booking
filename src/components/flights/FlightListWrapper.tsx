"use client";

import { Flight } from "@/types/database.types";
import FlightList from "./FlightList";

type FlightListWrapperProps = {
  flights: Flight[];
  type: "outbound" | "return";
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
};

export default function FlightListWrapper({
  flights,
  type,
  passengers,
}: FlightListWrapperProps) {
  return <FlightList flights={flights} type={type} passengers={passengers} />;
}
