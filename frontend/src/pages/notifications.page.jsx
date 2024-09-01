import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginatioData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "like", "comment", "reply"];
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    userAuth,
    userAuth: { access_token, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);

  const fetchNotifications = async ({ page, deletedDocCount = 0 }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}notifications`,
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const formattedData = await filterPaginatioData({
        state: notifications,
        data: data.notifications,
        page,
        countRoute: "all-notification-count",
        data_to_send: { filter },
        user: access_token,
      });

      if (new_notification_available) {
        setUserAuth({ ...userAuth, new_notification_available: false });
      }

      setNotifications(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilter = (filterName) => {
    setFilter(filterName);
    setLoading(true); // Set loading to true when changing filter
    setNotifications(null); // Clear current notifications while fetching new ones
  };

  return (
    <div>
      <h1 className="max-md:hidden text-2xl my-6">Recent Notifications</h1>
      <div className="my-4 flex gap-2">
        {filters.map((filterName, i) => (
          <button
            key={i}
            className={
              "py-2 " + (filter === filterName ? "btn-dark" : "btn-light")
            }
            onClick={() => handleFilter(filterName)} // Pass the filterName directly
          >
            {filterName}
          </button>
        ))}
      </div>
      <div>
        {loading ? (
          <Loader />
        ) : notifications && notifications.results.length ? (
          <>
            {notifications.results.map((notification, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                <NotificationCard
                  data={notification}
                  index={i}
                  notificationState={{ notifications, setNotifications }}
                />
              </AnimationWrapper>
            ))}

            <LoadMoreDataBtn
              state={notifications}
              fetchDataFun={fetchNotifications}
              additionalParam={{
                deletedDocCount: notifications.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="Nothing Available" />
        )}
      </div>
    </div>
  );
};

export default Notifications;
