import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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


const Card = ({ items }) => {
  const { userInfo } = useSelector((state) => state.auth);  // Get user info from the Redux store
  const { keyword } = useParams();  // Get the keyword parameter from the URL
  const userId = userInfo?._id;  // Extract the user ID from user info
  const [addBookmark] = useAddBookmarkMutation();  // Hook to add a bookmark
  const [deleteBookmark] = useDeleteBookmarkMutation();  // Hook to delete a bookmark
  const { data: bookmarks, refetch } = useGetBookmarksQuery(
    { userId, keyword },  // Query bookmarks for the user based on the keyword
    {
      refetchOnMountOrArgChange: true,  // Refetch bookmarks when userId or keyword changes
    }
  );

  useEffect(() => {
    if (userId) {
      refetch();  // Refetch bookmarks if the user is logged in
    }
  }, [userId, refetch]);

  const location = useLocation();
  const isBookmarksInUrl = location.pathname.includes("/bookmarks");  // Check if the current page is the bookmarks page


  // Function to check if an item is already bookmarked
  const isItemBookMarked = (itemId) =>
    bookmarks?.some((bookmark) => bookmark.itemId === itemId);

  // Function to handle adding an item to bookmarks
  const handleBookmarkClick = async (item) => {
    if (!userInfo) {
      toast.error("You must be logged in to add bookmarks");
      return;
    }

    try {
      // Prepare bookmark data to be added
      const bookmarkData = {
        user: userId,
        itemId: item.id,
        backdrop_path: item.backdrop_path,
        title: item.title || null,
        name: item.name || null,
        release_date: item.release_date || null,
        first_air_date: item.first_air_date || null,
      };

      await addBookmark(bookmarkData).unwrap();  // Add the bookmark to the database
      toast.success("Bookmark added successfully");  // Show success toast
      refetch();  // Refetch bookmarks to update the list
    } catch (error) {
      toast.error(error?.data?.message || "Error adding bookmark");  // Show error toast
    }
  };

  // Function to handle removing an item from bookmarks
  const handleDeleteClick = async (item) => {
    try {
      await deleteBookmark({
        user: userId,
        itemId: item.id,
      }).unwrap();  // Remove the bookmark from the database
      toast.success("Bookmark removed successfully");  // Show success toast
      refetch();  // Refetch bookmarks to update the list
    } catch (error) {
      toast.error(error?.data?.message || "Error removing bookmark");  // Show error toast
    }
  };

  // Function to remove an item from bookmarks only when on the bookmarks page
  const bookmarkDeleteClick = async (item) => {
    try {
      await deleteBookmark({
        user: userId,
        itemId: item.itemId,
      }).unwrap();  // Remove the bookmark from the database
      toast.success("Bookmark removed successfully");  // Show success toast
      refetch();  // Refetch bookmarks to update the list
    } catch (error) {
      toast.error(error?.data?.message || "Error removing bookmark");  // Show error toast
    }
  };

  return (
    <div className="grid grid-cols-12 gap-5">
      {items.map(
        (item) =>
          (item.title?.length < 22 || item.name?.length < 22) && (  // Only display items with short titles/names
            <div
              key={item.id}
              className="relative col-span-6 md:col-span-4 lg:col-span-3 items-between h-[175px] sm:h-[200px] grid grid-rows-12 group"
            >
              {isBookmarksInUrl ? (  // If on the bookmarks page, show delete button
                <span className="p-2 rounded-full bg-gray-700 bg-opacity-50 absolute right-1 top-1 sm:right-4 sm:top-3 z-40">
                  <IoBookmark
                    className="cursor-pointer"
                    onClick={() => bookmarkDeleteClick(item)}  // Delete the item from bookmarks
                  />
                </span>
              ) : isItemBookMarked(item.id) ? (  // If item is already bookmarked, show remove button
                <span className="p-2 rounded-full bg-gray-700 bg-opacity-50 absolute right-1 top-1 sm:right-4 sm:top-3 z-40">
                  <IoBookmark
                    className="cursor-pointer"
                    onClick={() => handleDeleteClick(item)}  // Remove the bookmark
                  />
                </span>
              ) : (  // If item is not bookmarked, show add button
                <span className="p-2 rounded-full bg-gray-900 bg-opacity-75 font-bold absolute right-1 top-1 sm:right-4 sm:top-3 z-40 hover:bg-white hover:text-black">
                  <CiBookmark
                    className="cursor-pointer"
                    onClick={() => handleBookmarkClick(item)}  // Add the bookmark
                  />
                </span>
              )}
              <div className="row-span-7 sm:row-span-9 rounded-lg overflow-hidden relative">
                <img
                  src={`${IMAGE_BASE_URL}/${item.backdrop_path}`}  // Display item image
                  alt=""
                  className="w-full sm:object-cover opacity-75"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="flex justify-around items-center rounded-full bg-white bg-opacity-10 px-2 py-1 gap-3 cursor-pointer">
                    <p className=" text-[35px] " >
                      <IoMdPlayCircle/>
                    </p>
                    <p>Play</p>
                  </div>
                </div>
              </div>
              <div className="row-span-1 text-gray-300 font-semibold flex gap-1 text-[13px] items-center pt-2">
                <span>
                  {item.release_date?.split("-")[0] ||
                    item.first_air_date?.split("-")[0]}  {/* Display release year */}
                </span>
                <span className="border-2 rounded-full"></span>
                <span>
                  {item.release_date ? (
                    <PiFilmStripFill className="rotate-90" />  // Display movie icon
                  ) : (
                    <PiTelevisionFill />  // Display TV show icon
                  )}
                </span>
                <span>{item.first_air_date ? "TV Show" : "Movie"}</span>
                <span className="border-2 rounded-full"></span>
                <span>{item.adult ? "18+" : "PG"}</span>  {/* Display age rating */}
              </div>
              <div className="row-span-4 sm:row-span-2 flex flex-wrap sm:items-center pt-2 text-[18px] font-bold ">
                <Link
                  to={
                    item.release_date
                      ? `moviedetail/${item.id || item.itemId}`  // Movie detail link
                      : `tvseriesdetail/${item.id || item.itemId}`  // TV series detail link
                  }
                  aria-label={`${item.release_date ? `moviedetail of ${item.id || item.itemId}` : `tvseriesdetail of ${item.id || item.itemId}`}`}
                >
                  {item.title || item.name}  {/* Display movie or TV show name */}
                </Link>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default Card;
