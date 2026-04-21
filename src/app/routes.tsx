import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ItemDetails from "./pages/ItemDetails";
import PostItem from "./pages/PostItem";
import EditItem from "./pages/EditItem";
import ClaimItem from "./pages/ClaimItem";
import MyItems from "./pages/MyItems";
import Messages from "./pages/Messages";
import UserProfile from "./pages/UserProfile";
import CampusAuction from "./pages/CampusAuction";
import AuctionItemDetails from "./pages/AuctionItemDetails";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/item/:id",
    element: (
      <ProtectedRoute>
        <ItemDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post",
    element: (
      <ProtectedRoute>
        <PostItem />
      </ProtectedRoute>
    ),
  },
  {
    path: "/claim/:id",
    element: (
      <ProtectedRoute>
        <ClaimItem />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-items",
    element: (
      <ProtectedRoute>
        <MyItems />
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages/:id",
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-item/:id",
    element: (
      <ProtectedRoute>
        <EditItem />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/:userId",
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auction",
    element: (
      <ProtectedRoute>
        <CampusAuction />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auction/:id",
    element: (
      <ProtectedRoute>
        <AuctionItemDetails />
      </ProtectedRoute>
    ),
  },
]);
