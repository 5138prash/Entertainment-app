import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { IoBookmark } from "react-icons/io5";
import { IMAGE_BASE_URL } from "../constants";
import { PiFilmStripFill, PiTelevisionFill } from "react-icons/pi";
import {
  useAddBookmarkMutation,
  useDeleteBookmarkMutation,
  useGetBookmarksQuery,
} from "../slices/bookmarkApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CiBookmark } from "react-icons/ci";
import { useParams } from "react-router-dom";
import { IoMdPlayCircle } from "react-icons/io";

// The component renders the trending movies or tv-series
const Trending = ({ items }) => {
  // Access the current user information from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?._id;  // Get the user ID
  const { keyword } = useParams(); // Get the search keyword from the URL parameters

  // Hook to handle adding and deleting bookmarks
  const [addBookmark] = useAddBookmarkMutation();
  const [deleteBookmark] = useDeleteBookmarkMutation();
  const { data: bookmarks, refetch } = useGetBookmarksQuery(
    { userId, keyword },  // Fetch bookmarks for the logged-in user with an optional keyword
    {
      refetchOnMountOrArgChange: true,  // Re-fetch bookmarks if userId or keyword changes
    }
  );

  // Refetch bookmarks whenever the user ID changes
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  // Check if the item is already bookmarked by comparing the item ID
  const isItemBookMarked = (itemId) =>
    bookmarks?.some((bookmark) => bookmark.itemId === itemId);

  // Handle the click event for adding a bookmark
  const handleBookmarkClick = async (item) => {
    if (!userInfo) {
      toast.error("You must be logged in to add bookmarks");
      return;
    }

    try {
      const bookmarkData = {
        user: userId,
        itemId: item.id,
        backdrop_path: item.backdrop_path,
        title: item.title || null,
        name: item.name || null,
        release_date: item.release_date || null,
        first_air_date: item.first_air_date || null,
      };

      // Add bookmark to the API
      await addBookmark(bookmarkData).unwrap();
      toast.success("Bookmark added successfully");
      refetch();  // Refetch to get the updated bookmarks list
    } catch (error) {
      toast.error(error?.data?.message || "Error adding bookmark");
    }
  };

  // Handle the click event for removing a bookmark
  const handleDeleteClick = async (item) => {
    try {
      await deleteBookmark({
        user: userId,
        itemId: item.id,
      }).unwrap();
      toast.success("Bookmark removed successfully");
      refetch();  // Refetch to get the updated bookmarks list
    } catch (error) {
      toast.error(error?.data?.message || "Error removing bookmark");
    }
  };

  return (
    <div className="overflow-x-auto whitespace-nowrap scroll-smooth scroll-container">
      <div className="flex space-x-5">
        {/* Loop through the items and render only those with short titles or names */}
        {items.map(
          (item) =>
            (item.title?.length < 22 || item.name?.length < 22) && (
              <div
                key={item.id}
                className="relative inline-block min-w-[300px] h-[175px] sm:w-[300px] sm:h-[200px] flex flex-col group"
              >
                {/* Conditional rendering of bookmark icon based on whether the item is bookmarked */}
                {isItemBookMarked(item.id) ? (
                  <span className="p-2 rounded-full bg-gray-700 bg-opacity-50 absolute right-4 top-3 z-40">
                    <IoBookmark
                      className="cursor-pointer"
                      onClick={() => handleDeleteClick(item)}
                    />
                  </span>
                ) : (
                  <span className="p-2 rounded-full bg-custom-dark-blue bg-opacity-75 font-bold absolute right-4 top-3 z-40 hover:bg-white hover:text-black">
                    <CiBookmark
                      className="cursor-pointer"
                      onClick={() => handleBookmarkClick(item)}
                    />
                  </span>
                )}
                <div className="flex-grow relative">
                  {/* Render backdrop image */}
                  <img
                    src={`${IMAGE_BASE_URL}/${item.backdrop_path}`}
                    alt=""
                    className="w-full h-full object-cover rounded-lg opacity-75"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="flex justify-around items-center rounded-full bg-white bg-opacity-10 px-2 py-1 gap-3 cursor-pointer">
                      <p className="text-[35px]">
                        <IoMdPlayCircle />
                      </p>
                      <p>Play</p>
                    </div>
                  </div>
                </div>
                {/* Movie/TV show metadata */}
                <div className="flex items-center gap-2 text-gray-300 pt-2 text-[15px] font-semibold absolute left-4 bottom-[40px]">
                  <span>
                    {item.release_date?.split("-")[0] ||
                      item.first_air_date?.split("-")[0]}
                  </span>
                  <span className="border-2 rounded-full"></span>

                  <span>
                    {item.release_date ? (
                      <PiFilmStripFill className="rotate-90" />
                    ) : (
                      <PiTelevisionFill />
                    )}
                  </span>

                  <span>
                    {item.first_air_date ? "TV Show" : "Movie"}
                  </span>
                  <span className="border-2 rounded-full"></span>
                  <span>{item.adult ? "18+" : "PG"}</span>
                </div>
                {/* Movie/TV show title and link */}
                <div className="pt-2 text-[18px] font-bold absolute left-4 bottom-[20px] z-40">
                  <Link
                    to={
                      item.release_date
                        ? `moviedetail/${item.id || item.itemId}`
                        : `tvseriesdetail/${item.id || item.itemId}`
                    }
                    aria-label={`${item.release_date ? `moviedetail of ${item.id || item.itemId}` : `tvseriesdetail of ${item.id || item.itemId}`}`}
                  >
                    {item.title || item.name}
                  </Link>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Trending;
