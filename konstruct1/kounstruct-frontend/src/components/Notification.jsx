import React from "react";
import Drawer from "./Drawer";

function Notification({ onClose }) {
  return (
    <Drawer onClose={onClose}>
      <h2 className="text-xl font-semibold">Notifications</h2>
      <ul className="mt-4 space-y-2 text-black">dkjwned wkendfew</ul>
    </Drawer>
  );
}

export default Notification;
