import { useState } from "react";
const Notifications = () => {
  const [filter, setFilter] = useState("all");
  let filers = ["all", "like", "comment", "reply"];
  return (
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>
    </div>
  );
};
export default Notifications;
