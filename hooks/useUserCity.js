"use client";
import { useEffect, useState } from "react";

export default function useUserCity() {
  const [city, setCity] = useState(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data?.city) {
          setCity(data.city.toLowerCase());
        }
      })
      .catch(() => {});
  }, []);

  return city;
}
