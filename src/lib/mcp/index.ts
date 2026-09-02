import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import updateMyProfile from "./tools/update-my-profile";
import listMyLinks from "./tools/list-my-links";
import createLink from "./tools/create-link";
import updateLink from "./tools/update-link";
import deleteLink from "./tools/delete-link";
import getProfileStats from "./tools/get-profile-stats";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "smartcardsa",
  title: "SmartCardSA",
  version: "0.1.0",
  instructions:
    "Tools for SmartCardSA digital business cards. Read and edit the signed-in user's profile, manage their SmartLink buttons, and review profile view/click stats.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    updateMyProfile,
    listMyLinks,
    createLink,
    updateLink,
    deleteLink,
    getProfileStats,
  ],
});
